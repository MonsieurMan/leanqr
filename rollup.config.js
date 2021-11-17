import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
// import commonjs from "@rollup/plugin-commonjs";
import resolve from '@rollup/plugin-node-resolve';
import config from './babel.config.json';
import typescript from '@rollup/plugin-typescript';

const extensions = ['.js', '.ts'];

export default [
	{
		input: 'lib/browser.ts',
		output: {
			dir: 'dist',
			format: 'esm',
			// name: "QRCode",
			// exports: "named",
		},
		external: [/@babel\/runtime/],
		plugins: [
			typescript(),
			// resolve({ extensions }),
			// babel({
			// 	...config,
			// 	extensions,
			// 	include: ["lib/**"],
			// 	babelHelpers: "runtime"
			// }),
			// terser(),
		],
	},
	// {
	// 	input: "helper/to-sjis-browser.js",
	// 	output: {
	// 		file: "build/qrcode.tosjis.js",
	// 		format: "iife",
	// 		exports: "none",
	// 		babelHelpers: "runtime",
	// 	},
	// 	plugins: [
	// 		resolve({ extensions }),
	// 		babel({ ...config, extensions, babelHelpers: 'runtime' }),
	// 		terser(),
	// 	],
	// },
];
