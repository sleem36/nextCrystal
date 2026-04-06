export const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export function utmFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of UTM_PARAM_KEYS) {
    const v = sp[key];
    const str = Array.isArray(v) ? v[0] : v;
    if (str) {
      out[key] = str;
    }
  }
  return out;
}
