import { Mode } from './mode';
import { BitBuffer } from '../data/bit-buffer';

export interface InputType {
	mode: Mode;
	index: number;
	length: number;
	data: string;
}

/**
 * https://www.qrcode.com/en/about/version.html calls it type of input.
 */
export abstract class InputTypeClass implements InputType {
	public abstract mode: Mode;
	// TODO: Should it be Uint8Array ?
	constructor(public data: string) {}
	public index: number = 0;
	public length: number = 0;
	abstract getLength(): number;
	abstract write(bitBuffer: BitBuffer): void;
	abstract getBitsLength(length?: number): number;
}
