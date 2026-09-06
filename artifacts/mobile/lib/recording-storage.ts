import * as FileSystem from 'expo-file-system/legacy';

function location(id: string) {
  if (!/^take-[a-z0-9-]+$/.test(id) || !FileSystem.documentDirectory) throw new Error('Recording storage unavailable');
  return `${FileSystem.documentDirectory}storycraft/${id}.m4a`;
}
export async function saveRecording(id: string, uri: string) {
  const destination = location(id);
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}storycraft`, { intermediates: true });
  await FileSystem.copyAsync({ from: uri, to: destination });
}
export async function loadRecording(id: string): Promise<string> {
  const uri = location(id);
  if (!(await FileSystem.getInfoAsync(uri)).exists) throw new Error('This recording is no longer on this device');
  return uri;
}
export async function removeRecording(id: string) { await FileSystem.deleteAsync(location(id), { idempotent: true }); }
export function releaseRecording(_uri: string) { /* Native file URLs do not need releasing. */ }
