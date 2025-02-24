import tap from 'tap';
import { BitBuffer } from '../../data-structure/bit-buffer.js';
import {KanjiSegment} from './kanji-segment.js';
import * as Mode from '../mode.js';
import { toSJIS } from '../../sjis/to-sjis.js';
import * as utils from '../../encoder/utils.js';

const test = tap.test;
utils.setToSJISFunction(toSJIS);

test('Kanji Segment', function (t) {
	const data = '漢字漾癶';
	const length = 4;
	const bitLength = 52; // length * 13
	const dataBit = [57, 250, 134, 174, 129, 134, 0];
	let kanjiData = new KanjiSegment(data);
	t.equal(kanjiData.mode, Mode.KANJI, 'Mode should be KANJI');
	t.equal(kanjiData.getLength(), length, 'Should return correct length');
	t.equal(
		kanjiData.getBitsLength(),
		bitLength,
		'Should return correct bit length'
	);
	let bitBuffer = new BitBuffer();
	kanjiData.write(bitBuffer);
	t.same(bitBuffer.buffer, dataBit, 'Should write correct data to buffer');
	kanjiData = new KanjiSegment('abc');
	bitBuffer = new BitBuffer();
	t.throws(function () {
		kanjiData.write(bitBuffer);
	}, 'Should throw if data is invalid');
	t.end();
});
