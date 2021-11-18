import tap from 'tap';
import * as QRCode from '../../../dist/esm/index.js';
import * as PngRenderer from '../../../dist/esm/renderer/png.js';
import { PNG } from 'pngjs';
import StreamMock from '../../writable-stream.js/index.js';
const test = tap.test;

test('PNG render', function (t) {
	const sampleQrData = QRCode.create('sample text', { version: 2 });
	let png;
	t.doesNotThrow(
		() => (png = PngRenderer.render(sampleQrData)),
		'Should not throw with only qrData param'
	);
	t.ok(png instanceof PNG, 'Should return an instance of PNG');
	t.equal(png.width, png.height, 'Should be a square image');
	// modules: 25, margins: 4 * 2, scale: 4
	t.equal(png.width, (25 + 4 * 2) * 4, 'Should have correct size');
	t.doesNotThrow(function () {
		png = PngRenderer.render(sampleQrData, {
			margin: 10,
			scale: 1,
		});
	}, 'Should not throw with options param');
	t.equal(png.width, png.height, 'Should be a square image');
	// modules: 25, margins: 10 * 2, scale: 1
	t.equal(png.width, 25 + 10 * 2, 'Should have correct size');
	t.end();
});
test('PNG renderToDataURL', function (t) {
	const sampleQrData = QRCode.create('sample text', { version: 2 });
	t.plan(6);
	PngRenderer.renderToDataURL(sampleQrData, function (err, url) {
		t.ok(!err, 'Should not generate errors with only qrData param');
		t.type(url, 'string', 'Should return a string');
	});
	PngRenderer.renderToDataURL(
		sampleQrData,
		{ margin: 10, scale: 1 },
		function (err, url) {
			t.ok(!err, 'Should not generate errors with options param');
			t.type(url, 'string', 'Should return a string');
			t.equal(
				url.split(',')[0],
				'data:image/png;base64',
				'Should have correct header'
			);
			const b64png = url.split(',')[1];
			t.equal(b64png.length % 4, 0, 'Should have a correct length');
		}
	);
});

test('PNG renderToFileStream', function (t) {
	const sampleQrData = QRCode.create('sample text', { version: 2 });
	t.doesNotThrow(function () {
		PngRenderer.renderToFileStream(new StreamMock(), sampleQrData);
	}, 'Should not throw with only qrData param');
	t.doesNotThrow(function () {
		PngRenderer.renderToFileStream(new StreamMock(), sampleQrData, {
			margin: 10,
			scale: 1,
		});
	}, 'Should not throw with options param');
	t.end();
});
