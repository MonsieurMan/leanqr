import { Mode } from './mode.js';
import { BitBuffer } from '../data-structure/bit-buffer';

// TODO: Get rid of this interface
export interface Segment {
	mode: Mode;
	index: number;
	length: number;
	data: string;
}

/**
 * TODO: Does it make sense to make this pluggable, 
 * so user can add their segment encoding of choice. e.g. Kanji
 */
export abstract class SegmentAbstract implements Segment {
	
	// TODO: Should it be Uint8Array ?
	constructor(public data: string) {}
	
	public index: number = 0;
	public length: number = 0;

	public abstract mode: Mode;

	abstract getLength(): number;
	abstract write(bitBuffer: BitBuffer): void;
	abstract getBitsLength(length?: number): number;
}
