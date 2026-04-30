function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeRuDigits(value: string): string {
  const raw = digitsOnly(value);
  if (!raw) return "";

  let digits = raw;

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  } else if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  return digits.slice(0, 11);
}

export function formatRuPhoneInput(value: string): string {
  const digits = normalizeRuDigits(value);
  if (!digits) return "";

  const national = digits.slice(1);
  const p1 = national.slice(0, 3);
  const p2 = national.slice(3, 6);
  const p3 = national.slice(6, 8);
  const p4 = national.slice(8, 10);

  let out = "+7";
  if (national.length > 0) out += ` (${p1}`;
  if (national.length >= 3) out += ")";
  if (national.length > 3) out += ` ${p2}`;
  if (national.length > 6) out += `-${p3}`;
  if (national.length > 8) out += `-${p4}`;

  return out;
}

export function isValidRuPhone(value: string): boolean {
  return normalizeRuDigits(value).length === 11;
}
