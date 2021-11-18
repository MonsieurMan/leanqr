import { Mode } from '../encoder/mode';
import { BitBuffer } from './bit-buffer';

export interface Data {
	mode: Mode;
	index: number;
	length: number;
	data: string;
}

export abstract class DataAbstractClass implements Data {
	public abstract mode: Mode;
	// TODO: Should it be Uint8Array ?
	constructor(public data: string) {}
	public index: number = 0;
	public length: number = 0;
	abstract getLength(): number;
	abstract write(bitBuffer: BitBuffer): void;
	abstract getBitsLength(length?: number): number;
}
