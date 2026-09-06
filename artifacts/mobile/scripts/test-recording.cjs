const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../components/story-recorder.tsx');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;
const flush = () => new Promise((resolve) => setImmediate(resolve));

async function scenario(blockAt, interrupt) {
  let release, background, blur, records = 0, busy = false;
  const gate = new Promise((resolve) => { release = resolve; });
  const effects = [];
  const wait = async (at) => { if (blockAt === at) await gate; };
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState: (initial) => [initial, () => {}], useRef: (current) => ({ current }),
    useCallback: (fn) => fn, useEffect: (fn) => { effects.push(fn); },
  };
  const recorder = {
    prepareToRecordAsync: () => wait('prepare'), record: () => { records += 1; },
    stop: async () => {}, getStatus: () => ({ durationMillis: 0 }),
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, { module, exports: module.exports, require: (name) => {
    if (name === 'react') return react;
    if (name === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: (s) => s }, AppState: { addEventListener: (_, fn) => { background = fn; return { remove() {} }; } } };
    if (name === 'expo-router') return { useFocusEffect: (fn) => { blur = fn(); } };
    if (name === '@expo/vector-icons') return { Feather: 'Icon' };
    if (name === '@/lib/recording-storage') return {};
    if (name === 'expo-audio') return {
      RecordingPresets: { HIGH_QUALITY: {} }, useAudioRecorder: () => recorder,
      useAudioRecorderState: () => ({ isRecording: false, durationMillis: 0 }),
      AudioModule: { requestRecordingPermissionsAsync: async () => { await wait('permission'); return { granted: true }; } },
      setAudioModeAsync: async (mode) => { if (mode.allowsRecording) await wait('mode'); },
    };
    throw new Error(name);
  } }, { filename });
  const tree = module.exports.StoryRecorder({ onSaved() {}, onBusy: (value) => { busy = value; } });
  const cleanups = effects.map((effect) => effect()).filter(Boolean);
  function findButton(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Pressable') return node;
    for (const child of node.props?.children ?? []) { const found = findButton(child); if (found) return found; }
  }
  findButton(tree).props.onPress();
  await flush();
  if (interrupt === 'background') background('background');
  if (interrupt === 'blur') blur();
  if (interrupt === 'unmount') cleanups.forEach((cleanup) => cleanup());
  release(); await flush(); await flush();
  assert.equal(records, interrupt ? 0 : 1, `${blockAt}/${interrupt}: unexpected microphone start`);
  assert.equal(busy, !interrupt, `${blockAt}/${interrupt}: incorrect navigation lock`);
}
(async () => {
  for (const stage of ['permission', 'mode', 'prepare']) {
    for (const interruption of ['background', 'blur', 'unmount']) await scenario(stage, interruption);
  }
  await scenario('prepare', null);
  console.log('PASS: recording preparation cancels across permission, audio-mode and preparation waits on background, blur and unmount; active recording keeps navigation locked.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
