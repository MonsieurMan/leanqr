import tap from 'tap';
import * as QRCode from '../../../dist/esm/index.js';
import * as TerminalRenderer from '../../../dist/esm/renderer/terminal.js';
const test = tap.test;

test('TerminalRenderer interface', function (t) {
	t.type(TerminalRenderer.render, 'function', 'Should have render function');
	t.end();
});

test('TerminalRenderer render big', function (t) {
	const sampleQrData = QRCode.create('sample text', { version: 2 });
	let str;
	t.doesNotThrow(function () {
		str = TerminalRenderer.render(sampleQrData);
	}, 'Should not throw with only qrData param');
	t.doesNotThrow(function () {
		str = TerminalRenderer.render(sampleQrData, {
			margin: 10,
			scale: 1,
		});
	}, 'Should not throw with options param');
	t.type(str, 'string', 'Should return a string');
	t.doesNotThrow(function () {
		str = TerminalRenderer.render(sampleQrData, { inverse: true });
	}, 'Should not throw with inverse options');
	t.type(str, 'string', 'Should return a string if inverse option is set');
	t.end();
});

test('TerminalRenderer render small', function (t) {
	const sampleQrData = QRCode.create('sample text', { version: 2 });
	let str;
	let calledCallback = false;
	const callback = function () {
		calledCallback = true;
	};
	t.doesNotThrow(function () {
		str = TerminalRenderer.render(sampleQrData);
	}, 'Should not throw with only qrData param');
	t.doesNotThrow(function () {
		str = TerminalRenderer.render(sampleQrData, {
			margin: 10,
			scale: 1,
			small: true,
		});
	}, 'Should not throw with options param and without callback');
	t.doesNotThrow(function () {
		str = TerminalRenderer.render(
			sampleQrData,
			{
				margin: 10,
				scale: 1,
				small: true,
			},
			callback
		);
	}, 'Should not throw with options param and callback');
	t.type(str, 'string', 'Should return a string');
	t.equal(calledCallback, true, 'string', 'Should call a callback');
	t.doesNotThrow(function () {
		str = TerminalRenderer.render(sampleQrData, { small: true, inverse: true });
	}, 'Should not throw with inverse options');
	t.type(str, 'string', 'Should return a string if inverse option is set');
	t.end();
});
