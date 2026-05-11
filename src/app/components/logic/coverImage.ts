import branding from "./branding";

export function isValidImageSrc(src: string): boolean {
  return /^(https?:\/\/|\/|data:)/.test(src);
}

export function resolveCoverSrc(
  coverPath: string | null | undefined,
  fallback: string = branding.campaignPlaceholderImage,
): string {
  if (!coverPath) return fallback;
  const trimmed = coverPath.trim();
  if (!trimmed || !isValidImageSrc(trimmed)) return fallback;
  return trimmed;
}
