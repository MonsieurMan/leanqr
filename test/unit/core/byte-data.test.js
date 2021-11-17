import tap from 'tap';
import { BitBuffer } from '../../../dist/esm/core/bit-buffer.js';
import { ByteData } from '../../../dist/esm/core/byte-data.js';
import * as Mode from '../../../dist/esm/core/mode.js';
const test = tap.test;

test('Byte Data', function (t) {
	const text = '1234';
	const textBitLength = 32;
	const textByte = [49, 50, 51, 52]; // 1, 2, 3, 4
	const utf8Text = '\u00bd + \u00bc = \u00be'; // 9 char, 12 byte
	const byteData = new ByteData(text);
	t.equal(byteData.mode, Mode.BYTE, 'Mode should be BYTE');
	t.equal(byteData.getLength(), text.length, 'Should return correct length');
	t.equal(
		byteData.getBitsLength(),
		textBitLength,
		'Should return correct bit length'
	);
	const bitBuffer = new BitBuffer();
	byteData.write(bitBuffer);
	t.same(bitBuffer.buffer, textByte, 'Should write correct data to buffer');
	const byteDataUtf8 = new ByteData(utf8Text);
	t.equal(
		byteDataUtf8.getLength(),
		12,
		'Should return correct length for utf8 chars'
	);
	t.end();
});
