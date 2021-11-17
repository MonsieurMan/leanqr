import tap from 'tap';
import fs from 'fs';
import path from 'path';
import * as QRCode from '../../dist/esm/index.js';
import * as QRCodeBrowser from '../../dist/esm/browser.js';
import * as Helpers from '../helpers.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const test = tap.test;
test('toString - no promise available', function (t) {
	Helpers.removeNativePromise();
	t.throws(() => {
		QRCode.toString();
	}, 'Should throw if text is not provided');
	t.throws(() => {
		QRCode.toString('some text');
	}, 'Should throw if a callback is not provided');
	t.throws(() => {
		QRCode.toString('some text', {});
	}, 'Should throw if a callback is not a function');
	t.throws(() => {
		QRCode.toString();
	}, 'Should throw if text is not provided (browser)');
	t.throws(() => {
		QRCodeBrowser.toString('some text');
	}, 'Should throw if a callback is not provided (browser)');
	t.throws(() => {
		QRCodeBrowser.toString('some text', {});
	}, 'Should throw if a callback is not a function (browser)');
	t.end();
	Helpers.restoreNativePromise();
});
test('toString', function (t) {
	t.plan(5);
	t.throws(() => {
		QRCode.toString();
	}, 'Should throw if text is not provided');
	QRCode.toString('some text', function (err, str) {
		t.ok(!err, 'There should be no error');
		t.equal(typeof str, 'string', 'Should return a string');
	});
	t.equal(
		typeof QRCode.toString('some text').then,
		'function',
		'Should return a promise'
	);
	QRCode.toString('some text', { errorCorrectionLevel: 'L' }).then(function (
		str
	) {
		t.equal(typeof str, 'string', 'Should return a string');
	});
});
test('toString (browser)', function (t) {
	t.plan(5);
	t.throws(() => {
		QRCodeBrowser.toString();
	}, 'Should throw if text is not provided');
	QRCodeBrowser.toString('some text', function (err, str) {
		t.ok(!err, 'There should be no error (browser)');
		t.equal(typeof str, 'string', 'Should return a string (browser)');
	});
	t.equal(
		typeof QRCodeBrowser.toString('some text').then,
		'function',
		'Should return a promise'
	);
	QRCodeBrowser.toString('some text', { errorCorrectionLevel: 'L' }).then(
		function (str) {
			t.equal(typeof str, 'string', 'Should return a string');
		}
	);
});
test('toString svg', function (t) {
	const file = path.join(__dirname, '/svgtag.expected.out');
	t.plan(6);
	QRCode.toString(
		'http://www.google.com',
		{
			version: 1,
			errorCorrectionLevel: 'H',
			type: 'svg',
		},
		function (err, code) {
			t.ok(err, 'there should be an error ');
			t.notOk(code, 'string should be null');
		}
	);
	fs.readFile(file, 'utf8', function (err, expectedSvg) {
		if (err) throw err;
		QRCode.toString(
			'http://www.google.com',
			{
				errorCorrectionLevel: 'H',
				type: 'svg',
			},
			function (err, code) {
				t.ok(!err, 'There should be no error');
				t.equal(code, expectedSvg, 'should output a valid svg');
			}
		);
	});
	QRCode.toString('http://www.google.com', {
		version: 1,
		errorCorrectionLevel: 'H',
		type: 'svg',
	}).catch(function (err) {
		t.ok(err, 'there should be an error (promise)');
	});
	fs.readFile(file, 'utf8', function (err, expectedSvg) {
		if (err) throw err;
		QRCode.toString('http://www.google.com', {
			errorCorrectionLevel: 'H',
			type: 'svg',
		}).then(function (code) {
			t.equal(code, expectedSvg, 'should output a valid svg (promise)');
		});
	});
});
test('toString browser svg', function (t) {
	const file = path.join(__dirname, '/svgtag.expected.out');
	t.plan(3);
	fs.readFile(file, 'utf8', function (err, expectedSvg) {
		if (err) throw err;
		QRCodeBrowser.toString(
			'http://www.google.com',
			{
				errorCorrectionLevel: 'H',
				type: 'svg',
			},
			function (err, code) {
				t.ok(!err, 'There should be no error');
				t.equal(code, expectedSvg, 'should output a valid svg');
			}
		);
		QRCodeBrowser.toString('http://www.google.com', {
			errorCorrectionLevel: 'H',
			type: 'svg',
		}).then(function (code) {
			t.equal(code, expectedSvg, 'should output a valid svg (promise)');
		});
	});
});
test('toString utf8', function (t) {
	const expectedUtf8 = [
		'                                 ',
		'                                 ',
		'    █▀▀▀▀▀█ █ ▄█  ▀ █ █▀▀▀▀▀█    ',
		'    █ ███ █ ▀█▄▀▄█ ▀▄ █ ███ █    ',
		'    █ ▀▀▀ █ ▀▄ ▄ ▄▀ █ █ ▀▀▀ █    ',
		'    ▀▀▀▀▀▀▀ ▀ ▀ █▄▀ █ ▀▀▀▀▀▀▀    ',
		'    ▀▄ ▀▀▀▀█▀▀█▄ ▄█▄▀█ ▄█▄██▀    ',
		'    █▄ ▄▀▀▀▄▄█ █▀▀▄█▀ ▀█ █▄▄█    ',
		'    █▄ ▄█▄▀█▄▄  ▀ ▄██▀▀ ▄  ▄▀    ',
		'    █▀▄▄▄▄▀▀█▀▀█▀▀▀█ ▀ ▄█▀█▀█    ',
		'    ▀ ▀▀▀▀▀▀███▄▄▄▀ █▀▀▀█ ▀█     ',
		'    █▀▀▀▀▀█ █▀█▀▄ ▄▄█ ▀ █▀ ▄█    ',
		'    █ ███ █ █ █ ▀▀██▀███▀█ ██    ',
		'    █ ▀▀▀ █  █▀ ▀ █ ▀▀▄██ ███    ',
		'    ▀▀▀▀▀▀▀ ▀▀▀  ▀▀ ▀    ▀  ▀    ',
		'                                 ',
		'                                 ',
	].join('\n');
	t.plan(9);
	QRCode.toString(
		'http://www.google.com',
		{
			version: 1,
			errorCorrectionLevel: 'H',
			type: 'utf8',
		},
		function (err, code) {
			t.ok(err, 'there should be an error ');
			t.notOk(code, 'string should be null');
		}
	);
	QRCode.toString(
		'http://www.google.com',
		{
			errorCorrectionLevel: 'M',
			type: 'utf8',
		},
		function (err, code) {
			t.ok(!err, 'There should be no error');
			t.equal(code, expectedUtf8, 'should output a valid symbol');
		}
	);
	QRCode.toString('http://www.google.com', function (err, code) {
		t.ok(!err, 'There should be no error');
		t.equal(
			code,
			expectedUtf8,
			'Should output a valid symbol with default options'
		);
	});
	QRCode.toString('http://www.google.com', {
		version: 1,
		errorCorrectionLevel: 'H',
		type: 'utf8',
	}).catch(function (err) {
		t.ok(err, 'there should be an error (promise)');
	});
	QRCode.toString('http://www.google.com', {
		errorCorrectionLevel: 'M',
		type: 'utf8',
	}).then(function (code) {
		t.equal(code, expectedUtf8, 'should output a valid symbol (promise)');
	});
	QRCode.toString('http://www.google.com').then(function (code) {
		t.equal(
			code,
			expectedUtf8,
			'Should output a valid symbol with default options (promise)'
		);
	});
});
test('toString terminal', function (t) {
	const expectedTerminal =
		fs.readFileSync(path.join(__dirname, '/terminal.expected.out')) + '';
	t.plan(3);
	QRCode.toString(
		'http://www.google.com',
		{
			errorCorrectionLevel: 'M',
			type: 'terminal',
		},
		function (err, code) {
			t.ok(!err, 'There should be no error');
			t.equal(code + '\n', expectedTerminal, 'should output a valid symbol');
		}
	);
	QRCode.toString('http://www.google.com', {
		errorCorrectionLevel: 'M',
		type: 'terminal',
	}).then(function (code) {
		t.equal(
			code + '\n',
			expectedTerminal,
			'should output a valid symbol (promise)'
		);
	});
});
