export type ErrorCorrectionLevel = 'low' | 'medium' | 'high' | 'quartile';
export interface ErrorCorrectionLevelBits {
	bit: number;
}

function fromString(string: string): ErrorCorrectionLevelBits {
	if (typeof string !== 'string') {
		throw new Error('Param is not a string');
	}
	const lcStr = string.toLowerCase();
	// TODO: Get rid of single letter syntax
	switch (lcStr) {
		case 'l':
		case 'low':
			return L;
		case 'm':
		case 'medium':
			return M;
		case 'q':
		case 'quartile':
			return Q;
		case 'h':
		case 'high':
			return H;
		default:
			throw new Error('Unknown ErrorCorrectionLevel: ' + string);
	}
}

export const L: ErrorCorrectionLevelBits = { bit: 1 };
export const M: ErrorCorrectionLevelBits = { bit: 0 };
export const Q: ErrorCorrectionLevelBits = { bit: 3 };
export const H: ErrorCorrectionLevelBits = { bit: 2 };

// TODO: get rid with TS ?
export function isValid(level: ErrorCorrectionLevelBits | undefined) {
	return (
		level && typeof level.bit !== 'undefined' && level.bit >= 0 && level.bit < 4
	);
}

export function from(
	value: ErrorCorrectionLevel | ErrorCorrectionLevelBits | string | undefined,
	defaultValue: ErrorCorrectionLevelBits = Q
): ErrorCorrectionLevelBits {
	try {
		if (typeof value === 'string') {
			return fromString(value);
		} else if (value && isValid(value)) {
			return value;
		}
	} catch (error) {
		console.warn(error);
		console.warn('Used default error correction level');
	} finally {
		return defaultValue;
	}
}
