import * as Mode from '../mode.js';
import { BitBuffer } from '../../data/bit-buffer.js';
import { SegmentAbstract } from '../segment.js';

export class ByteSegment extends SegmentAbstract {
	public mode: Mode.Mode = Mode.BYTE;

	constructor(data: string) {
		super(data);
		const textEncoder = new TextEncoder();
		this.data = textEncoder.encode(data) as any; // FIXME: Typing problem
	}

	getLength() {
		return this.data.length;
	}

	getBitsLength() {
		return ByteSegment.getBitsLength(this.data.length);
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
