/**
 * QRCode version ranges from 1 to 40, translated directly to 
 * the counts of modules used. 
 * Each version increases module count by 4.
 * 
 * It directly impacts the encoding capacity, the higher the version
 * the more data you can encode as a QRCode.
 * 
 * Version 1 -> 21x21 modules
 * Version 40 -> 177x177 modules
 */

import * as Utils from './utils.js';
import * as ECCode from '../error-correction/error-correction-code.js';
import * as ECLevel from '../error-correction/error-correction-level.js';
import * as Mode from '../data-encoding/mode.js';
import { SegmentAbstract } from '../data-encoding/segment.js';
import { ErrorCorrectionLevelBits } from "../error-correction/error-correction-level";


export function from(value: unknown, defaultValue: number = 1): number {
	let testValue: number;
	if (typeof value === 'string') {
		testValue = parseInt(value, 10);
	} else if (typeof value === 'number') {
		testValue = value;
	} else {
		return defaultValue;
	}

	return isValid(testValue) ? testValue : defaultValue;
}

export function isValid(version?: number) {
	return version && !isNaN(version) && version >= 1 && version <= 40;
}

export function getCapacity(
	version: number,
	errorCorrectionLevel?: ErrorCorrectionLevelBits,
	mode?: Mode.Mode
): number {
	if (!isValid(version)) {
		throw new Error('Invalid QR Code version');
	}
	// Use Byte mode as default
	if (typeof mode === 'undefined') {
		mode = Mode.BYTE;
	}
	// Total codewords for this QR code version (Data + Error correction)
	const totalCodewords = Utils.getSymbolTotalCodewords(version);
	// Total number of error correction codewords
	const ecTotalCodewords = ECCode.getTotalCodewordsCount(
		version,
		errorCorrectionLevel
	);
	// Total number of data codewords
	const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
	if (mode === Mode.MIXED) {
		return dataTotalCodewordsBits;
	}
	const usableBits =
		dataTotalCodewordsBits - getReservedBitsCount(mode, version);

	// Return max number of storable codewords
	switch (mode) {
		case Mode.NUMERIC:
			return Math.floor((usableBits / 10) * 3);
		case Mode.ALPHANUMERIC:
			return Math.floor((usableBits / 11) * 2);
		case Mode.KANJI:
			return Math.floor(usableBits / 13);
		case Mode.BYTE:
		default:
			return Math.floor(usableBits / 8);
	}
}

/**
 *
 * @param {Uint8Array} data
 * @param {*} errorCorrectionLevel
 * @returns
 */
export function getBestVersionForData(
	data: SegmentAbstract | Array<SegmentAbstract>,
	errorCorrectionLevel?: ErrorCorrectionLevelBits
): number | undefined {
	let seg;
	const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);

	if (Array.isArray(data)) {
		if (data.length > 1) {
			return getBestVersionForMixedData(data, ecl);
		}
		if (data.length === 0) {
			return 1;
		}
		seg = data[0];
	} else {
		seg = data;
	}

	return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
}

export function getEncodedBits(version: number): number {
	if (!isValid(version) || version < 7) {
		throw new Error('Invalid QR Code version');
	}
	let d = version << 12;
	while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
		d ^= G18 << (Utils.getBCHDigit(d) - G18_BCH);
	}
	return (version << 12) | d;
}

// Generator polynomial used to encode version information
const G18 =
	(1 << 12) |
	(1 << 11) |
	(1 << 10) |
	(1 << 9) |
	(1 << 8) |
	(1 << 5) |
	(1 << 2) |
	(1 << 0);

const G18_BCH = Utils.getBCHDigit(G18);

function getBestVersionForDataLength(
	mode: Mode.Mode,
	length: number,
	errorCorrectionLevel?: ErrorCorrectionLevelBits
) {
	for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
		if (length <= getCapacity(currentVersion, errorCorrectionLevel, mode)) {
			return currentVersion;
		}
	}

	return undefined;
}

function getReservedBitsCount(mode: Mode.Mode, version: number) {
	// Character count indicator + mode indicator bits
	return Mode.getCharCountIndicator(mode, version) + 4;
}

function getTotalBitsFromDataArray(
	segments: Array<SegmentAbstract>,
	version: number
) {
	let totalBits = 0;
	segments.forEach(function (data) {
		const reservedBits = getReservedBitsCount(data.mode, version);
		totalBits += reservedBits + data.getBitsLength();
	});
	return totalBits;
}

function getBestVersionForMixedData(
	segments: Array<SegmentAbstract>,
	errorCorrectionLevel?: ErrorCorrectionLevelBits
) {
	for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
		const length = getTotalBitsFromDataArray(segments, currentVersion);

		if (length <= getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
			return currentVersion;
		}
	}

	return undefined;
}
