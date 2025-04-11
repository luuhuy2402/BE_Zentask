import { pick } from "lodash";

export const slugify = (val) => {
    if (!val) return "";
    return String(val)
        .normalize("NFKD") // split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
        .trim() // trim leading or trailing whitespace
        .toLowerCase() // convert to lowercase
        .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .replace(/-+/g, "-"); // remove consecutive hyphens
};

/**
 * Example:
 */
// const originalStringTest = 'Lưu Huy Hiếu'
// const slug = slugify(originalStringTest)

// console.log('originalStringTest:', originalStringTest)
// console.log('slug:', slug)
/**
 * Results:
 *
 * Original String Test: 'Lưu Huy Hiếu''
 * Slug Result: luu-huy-hieu
 */

export const pickUser = (user) => {
    if (!user) return {};
    return pick(user, [
        "_id",
        "email",
        "username",
        "displayName",
        "avatar",
        "role",
        "isActive",
        "createdAt",
        "updatedAt",
    ]);
};
