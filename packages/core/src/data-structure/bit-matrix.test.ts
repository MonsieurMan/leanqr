import tap from 'tap';
import { BitMatrix } from './bit-matrix.js';
const test = tap.test;

test('Bit Matrix', function (t) {
	t.throws(function () {
		new BitMatrix(0);
	}, 'Should throw if size is 0');
	t.throws(function () {
		new BitMatrix(-1);
	}, 'Should throw if size less than 0');
	const bm = new BitMatrix(2);
	t.equal(bm.size, 2, 'Should have correct size');
	t.equal(bm.data.length, 4, 'Should correctly set buffer size');
	bm.set(0, 1, 1, true);
	t.ok(bm.get(0, 1), 'Should correctly set bit to true');
	t.ok(bm.isReserved(0, 1), 'Should correctly set bit as reserved');
	bm.xor(0, 1, 1);
	t.ok(!bm.get(0, 1), 'Should correctly xor bit');
	bm.set(0, 1, 0, false);
	t.notOk(bm.get(0, 1), 'Should correctly set bit to false');
	t.end();
});
