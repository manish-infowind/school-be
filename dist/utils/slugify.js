"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.ensureUniqueSlug = ensureUniqueSlug;
/**
 * Convert string to URL-safe slug: lowercase, spaces to hyphens, strip non-alphanumeric.
 */
function slugify(text) {
    if (!text || typeof text !== 'string')
        return '';
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
async function ensureUniqueSlug(findExisting, baseSlug) {
    let slug = baseSlug;
    let counter = 2;
    while (await findExisting(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}
//# sourceMappingURL=slugify.js.map