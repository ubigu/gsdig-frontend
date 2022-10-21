export function lengthLimited(s: string, len: number): string {
  return (!s || s.length <= len)
    ? s
    : `${s.substring(0, len)}...`
}
