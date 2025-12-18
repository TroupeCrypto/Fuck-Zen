export function toSlug(name) {
  if (!name) return '';

  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const truncated = normalized.slice(0, 64);

  return truncated.replace(/^-+|-+$/g, '');
}
