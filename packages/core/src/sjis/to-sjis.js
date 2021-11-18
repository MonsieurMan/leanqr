import { SJIS_UTF8 } from './sjis-utf8.js';

/**
 * Convert UT8 encoded string to SJIS.
 * https://en.wikipedia.org/wiki/Shift_JIS
 *
 * TODO: Should move from core, also there is probably a library doing this better now ?
 *
 * @param {*} utf8Char
 * @returns
 */
export function toSJIS(utf8Char) {
	if (!utf8Char || utf8Char === '') {
		return;
	}

	for (let i = 0; i < SJIS_UTF8.length; i++) {
		const kanji = SJIS_UTF8[i][1];
		// FIXME: Property 'indexOf' does not exist on type 'string | number'.
		const posIndex = kanji.indexOf(utf8Char);

		if (posIndex >= 0) {
			return SJIS_UTF8[i][0] + posIndex;
		}
	}
}

export default toSJIS;
