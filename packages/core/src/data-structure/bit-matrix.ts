/**
 * Helper class to handle QR Code symbol modules.
 *
 * @param {Number} size Symbol size
 */
export class BitMatrix {
	public data: Uint8Array;
	public reservedBit: Uint8Array;

	constructor(public readonly size: number) {
		if (!size || size < 1) {
			throw new Error('BitMatrix size must be defined and greater than 0');
		}
		this.size = size;
		this.data = new Uint8Array(size * size);
		this.reservedBit = new Uint8Array(size * size);
	}

	/**
	 * Set bit value at specified location
	 * If reserved flag is set, this bit will be ignored during masking process
	 *
	 * @param {Number}  row
	 * @param {Number}  col
	 * @param {Number} value
	 * @param {Boolean} reserved
	 */
	set(row: number, col: number, value: number, reserved: boolean): void {
		const index = row * this.size + col;
		this.data[index] = value;

		if (reserved) {
			// Replaced from 'true'
			this.reservedBit[index] = 1;
		}
	}

	/**
	 * Returns bit value at specified location
	 *
	 * @param  {Number}  row
	 * @param  {Number}  col
	 * @return {Number}
	 */
	get(row: number, col: number): number {
		return this.data[row * this.size + col];
	}

	/**
	 * Applies xor operator at specified location
	 * (used during masking process)
	 *
	 * @param {Number}  row
	 * @param {Number}  col
	 * @param {Number} value
	 */
	xor(row: number, col: number, value: number) {
		this.data[row * this.size + col] ^= value;
	}

	/**
	 * Check if bit at specified location is reserved
	 *
	 * @param {Number}   row
	 * @param {Number}   col
	 * @return {Number}
	 */
	isReserved(row: number, col: number): number {
		return this.reservedBit[row * this.size + col];
	}
}
