export function isTs(name: string): boolean {
  const pos = name.lastIndexOf(".");
  if(pos < 1) return false;
  return name.slice(pos + 1) === 'ts';
}
