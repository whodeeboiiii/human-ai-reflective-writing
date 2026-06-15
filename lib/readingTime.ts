// 한국어 기준 분당 약 500자
export function getReadingTime(content: string): string {
  const chars = content.replace(/<[^>]+>/g, '').length;
  const minutes = Math.max(1, Math.round(chars / 500));
  return `${minutes}분`;
}
