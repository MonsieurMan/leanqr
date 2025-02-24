import * as Mode from '../mode.js';
import * as Utils from '../../encoder/utils.js';
import { BitBuffer } from '../../data-structure/bit-buffer.js';
import { SegmentAbstract } from '../segment.js';

// TODO: Should move from core.
export class KanjiSegment extends SegmentAbstract {
	public mode: Mode.Mode = Mode.KANJI;

	constructor(data: string) {
		super(data);
	}

	getLength() {
		return this.data.length;
	}

	getBitsLength() {
		return KanjiSegment.getBitsLength(this.data.length);
	}

	write(bitBuffer: BitBuffer) {
		let i;
		// In the Shift JIS system, Kanji characters are represented by a two byte combination.
		// These byte values are shifted from the JIS X 0208 values.
		// JIS X 0208 gives details of the shift coded representation.
		for (i = 0; i < this.data.length; i++) {
			let value = Utils.toSJIS(this.data[i]);
			// For characters with Shift JIS values from 0x8140 to 0x9FFC:
			// @ts-ignore
			if (value >= 0x8140 && value <= 0x9ffc) {
				// Subtract 0x8140 from Shift JIS value
				// @ts-ignore
				value -= 0x8140;
				// For characters with Shift JIS values from 0xE040 to 0xEBBF
				// @ts-ignore
			} else if (value >= 0xe040 && value <= 0xebbf) {
				// @ts-ignore
				// Subtract 0xC140 from Shift JIS value
				value -= 0xc140;
			} else {
				throw new Error(
					'Invalid SJIS character: ' +
						this.data[i] +
						'\n' +
						'Make sure your charset is UTF-8'
				);
			}
			// @ts-ignore
			// Multiply most significant byte of result by 0xC0
			// and add least significant byte to product
			value = ((value >>> 8) & 0xff) * 0xc0 + (value & 0xff);
			// @ts-ignore
			// Convert result to a 13-bit binary string
			bitBuffer.put(value, 13);
		}
	}
	static getBitsLength(length: number) {
		return length * 13;
	}
}
export default KanjiSegment;
