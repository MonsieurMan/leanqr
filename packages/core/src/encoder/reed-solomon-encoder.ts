import * as Polynomial from './polynomial.js';

/**
 * TODO: Document why we need ReedSolomonEncoder
 */
export class ReedSolomonEncoder {
	public genPoly?: Uint8Array;
	constructor(public degree: number = 0) {
		this.genPoly = undefined;
		this.degree = degree;

		// Meaning different than 0 _-_
		if (this.degree) {
			this.initialize(this.degree);
		}
	}

	/**
	 * Initialize the encoder.
	 * The input param should correspond to the number of error correction codewords.
	 *
	 * @param  {Number} degree
	 */
	initialize(degree: number) {
		// create an irreducible generator polynomial
		this.degree = degree;
		this.genPoly = Polynomial.generateECPolynomial(this.degree);
	}

	/**
	 * Encodes a chunk of data
	 *
	 * @param  {Uint8Array} data Buffer containing input data
	 * @return {Uint8Array}      Buffer containing encoded data
	 */
	encode(data: Uint8Array): Uint8Array {
		if (!this.genPoly) {
			throw new Error('Encoder not initialized');
		}
		// Calculate EC for this data block
		// extends data size to data+genPoly size
		const paddedData = new Uint8Array(data.length + this.degree);
		paddedData.set(data);
		// The error correction codewords are the remainder after dividing the data codewords
		// by a generator polynomial
		const remainder = Polynomial.mod(paddedData, this.genPoly);
		// return EC data blocks (last n byte, where n is the degree of genPoly)
		// If coefficients number in remainder are less than genPoly degree,
		// pad with 0s to the left to reach the needed number of coefficients
		const start = this.degree - remainder.length;
		if (start > 0) {
			const buff = new Uint8Array(this.degree);
			buff.set(remainder, start);
			return buff;
		}
		return remainder;
	}
}
export default ReedSolomonEncoder;
