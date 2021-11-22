import { getSymbolSize } from '../encoder/utils.js';

const FINDER_PATTERN_SIZE = 7;

export function getPositions(version: number): number[][] {
	const size = getSymbolSize(version);
	return [
		// top-left
		[0, 0],
		// top-right
		[size - FINDER_PATTERN_SIZE, 0],
		// bottom-left
		[0, size - FINDER_PATTERN_SIZE],
	];
}
