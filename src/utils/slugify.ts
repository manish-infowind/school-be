/**
 * Convert string to URL-safe slug: lowercase, spaces to hyphens, strip non-alphanumeric.
 */
export function slugify(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Ensure a unique slug for a collection by appending -2, -3, ... if the base slug exists.
 * @param findExisting - async function (slug: string) => document or null
 * @param baseSlug - initial slug from slugify(name)
 * @returns unique slug
 */
export async function ensureUniqueSlug(
    findExisting: (slug: string) => Promise<{ _id: unknown } | null>,
    baseSlug: string
): Promise<string> {
    let slug = baseSlug;
    let counter = 2;
    while (await findExisting(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}
