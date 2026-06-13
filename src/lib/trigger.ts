export const triggerTerms = [
  "itadakimasu",
  "いただきます",
  "jal meokgetseumnida",
  "jal meokgesseumnida",
  "jalmeokgetseumnida",
  "잘 먹겠습니다",
  "잘먹겠습니다",
];

export function heardMealTrigger(text: string) {
  const normalized = text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const compact = normalized.replace(/\s/g, "");

  return triggerTerms.some((term) => {
    const normalizedTerm = term
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    return (
      normalized.includes(normalizedTerm) ||
      compact.includes(normalizedTerm.replace(/\s/g, ""))
    );
  });
}

export function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}
