import * as Regex from '../mode/regex.js';
import { isValid as isValidVersion } from '../encoder/version.js';

/**
 * Get mode object from its name
 *
 * @param   {String} string Mode name
 * @returns {Mode}          Mode object
 */
function fromString(string: string): Mode {
	if (typeof string !== 'string') {
		throw new Error('Param is not a string');
	}

	const lcStr = string.toLowerCase();

	switch (lcStr) {
		case 'numeric':
			return NUMERIC;
		case 'alphanumeric':
			return ALPHANUMERIC;
		case 'kanji':
			return KANJI;
		case 'byte':
			return BYTE;
		default:
			throw new Error('Unknown mode: ' + string);
	}
}

// TODO: Change Mode to InputType
export const NUMERIC: Mode = {
	id: 'Numeric',
	bit: 1 << 0,
	ccBits: [10, 12, 14],
};

export const ALPHANUMERIC: Mode = {
	id: 'Alphanumeric',
	bit: 1 << 1,
	ccBits: [9, 11, 13],
};

export const BYTE: Mode = {
	id: 'Byte',
	bit: 1 << 2,
	ccBits: [8, 16, 16],
};

export const KANJI: Mode = {
	id: 'Kanji',
	bit: 1 << 3,
	ccBits: [8, 10, 12],
};

export const MIXED: Mode = {
	id: 'mixed',
	bit: -1,
	ccBits: [],
};

export interface Mode {
	id: string;
	bit: number;
	ccBits: Array<number>;
}

export function getCharCountIndicator(mode: Mode, version: number): number {
	if (!mode.ccBits) {
		throw new Error('Invalid mode: ' + mode);
	}
	if (!isValidVersion(version)) {
		throw new Error('Invalid version: ' + version);
	}

	if (version >= 1 && version < 10) {
		return mode.ccBits[0];
	} else if (version < 27) {
		return mode.ccBits[1];
	}

	return mode.ccBits[2];
}

export function getBestModeForData(dataStr: string): Mode {
	if (Regex.testNumeric(dataStr)) {
		return NUMERIC;
	} else if (Regex.testAlphanumeric(dataStr)) {
		return ALPHANUMERIC;
	} else if (Regex.testKanji(dataStr)) {
		return KANJI;
	}

	return BYTE;
}

export function toString(mode: Mode): string {
	if (mode && mode.id) {
		return mode.id;
	}
	
	throw new Error('Invalid mode');
}

export function isValid(mode?: any): mode is Mode {
	return mode && mode.bit && mode.ccBits;
}

export function from(
	value: Mode | string | undefined,
	defaultValue: Mode = NUMERIC
): Mode {
	if (isValid(value)) {
		return value;
	}
	try {
		return value ? fromString(value) : defaultValue;
	} catch (e) {
		return defaultValue;
	}
}
