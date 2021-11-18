import { spawn } from 'child_process';
import path from 'path';

const opt = {
	cwd: process.cwd(),
	env: (function () {
		process.env.NODE_PATH = './' + path.delimiter + './lib';
		return process.env;
	})(),
	stdio: [process.stdin, process.stdout, process.stderr],
};
spawn(
	'../../node_modules/.bin/tap',
	['--cov', '--100', process.argv[2] || 'src/**/*.test.js'],
	opt
);
