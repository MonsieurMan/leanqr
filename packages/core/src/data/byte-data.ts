import * as Mode from '../encoder/mode.js';
import { BitBuffer } from './bit-buffer.js';
import { Data, DataAbstractClass } from './data.js';

export class ByteData extends DataAbstractClass {
	public mode: Mode.Mode = Mode.BYTE;
	constructor(data: string) {
		super(data);
		const textEncoder = new TextEncoder();
		this.data = textEncoder.encode(data).toString(); // FIXME: Is the toString a good idea here?
	}
	getLength() {
		return this.data.length;
	}
	getBitsLength() {
		return ByteData.getBitsLength(this.data.length);
	}
	write(bitBuffer: BitBuffer) {
		for (let i = 0, l = this.data.length; i < l; i++) {
			// TODO: data type number | strings are really mixed.
			bitBuffer.put(parseInt(this.data[i]), 8);
		}
	}
	static getBitsLength(length: number) {
		return length * 8;
	}
}
