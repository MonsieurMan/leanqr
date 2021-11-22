import tap from 'tap';
import { BitBuffer } from '../../data-structure/bit-buffer.js';
import { AlphanumericSegment } from './alphanumeric-segment.js';
import * as Mode from '../mode.js';
const test = tap.test;
const testData = [
	{
		data: 'A',
		length: 1,
		bitLength: 6,
		dataBit: [40],
	},
	{
		data: 'AB',
		length: 2,
		bitLength: 11,
		dataBit: [57, 160],
	},
	{
		data: 'ABC12',
		length: 5,
		bitLength: 28,
		dataBit: [57, 168, 116, 32],
	},
];
test('Alphanumeric Segment', function (t) {
	testData.forEach(function (data) {
		const alphanumericData = new AlphanumericSegment(data.data);
		t.equal(
			alphanumericData.mode,
			Mode.ALPHANUMERIC,
			'Mode should be ALPHANUMERIC'
		);
		t.equal(
			alphanumericData.getLength(),
			data.length,
			'Should return correct length'
		);
		t.equal(
			alphanumericData.getBitsLength(),
			data.bitLength,
			'Should return correct bit length'
		);
		const bitBuffer = new BitBuffer();
		alphanumericData.write(bitBuffer);
		t.same(bitBuffer.buffer, data.dataBit, 'Should write correct data to buffer');
	});
	t.end();
});
