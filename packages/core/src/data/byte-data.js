import * as Mode from '../encoder/mode.js';

export class ByteData {
	constructor(data) {
		this.mode = Mode.BYTE;
		const textEncoder = new TextEncoder();
		this.data = textEncoder.encode(data);
	}
	getLength() {
		return this.data.length;
	}
	getBitsLength() {
		return ByteData.getBitsLength(this.data.length);
	}
	write(bitBuffer) {
		for (let i = 0, l = this.data.length; i < l; i++) {
			bitBuffer.put(this.data[i], 8);
		}
	}
	static getBitsLength(length) {
		return length * 8;
	}
}
