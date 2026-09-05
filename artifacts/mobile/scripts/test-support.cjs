const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
const slots = [];
let cursor = 0;
const React = {
  createContext: () => ({ Provider: 'Provider' }),
  createElement: (_type, props) => ({ props }),
  useEffect: () => {}, useMemo: (fn) => fn(),
  useRef: (initial) => { const slot = cursor++; if (!(slot in slots)) slots[slot] = { current: initial }; return slots[slot]; },
  useState: (initial) => {
    const slot = cursor++;
    if (!(slot in slots)) slots[slot] = initial;
    return [slots[slot], (value) => { slots[slot] = typeof value === 'function' ? value(slots[slot]) : value; }];
  },
};
function loadSource(filename) {
  let file = path.resolve(filename);
  if (!path.extname(file)) file += fs.existsSync(`${file}.ts`) ? '.ts' : '.tsx';
  if (cache.has(file)) return cache.get(file).exports;
  const moduleShim = { exports: {} }; cache.set(file, moduleShim);
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  vm.runInNewContext(compiled, { exports: moduleShim.exports, module: moduleShim, Date,
    require: (name) => {
      if (name === 'react') return React;
      if (name === 'react-native') return { AppState: {} };
      if (name === 'expo-haptics') return { selectionAsync: async () => {}, notificationAsync: async () => {}, NotificationFeedbackType: { Success: 'success' } };
      if (name === '@react-native-async-storage/async-storage') return {};
      if (name.startsWith('@/')) return loadSource(path.join(root, name.slice(2)));
      if (name.startsWith('.')) return loadSource(path.resolve(path.dirname(file), name));
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: file });
  return moduleShim.exports;
}
const progress = loadSource(path.join(root, 'context/progress.tsx'));
module.exports = { slots, progress, loadSource: (file) => loadSource(path.join(root, file)), render: () => { cursor = 0; return progress.ProgressProvider({ children: null }).props.value; } };
