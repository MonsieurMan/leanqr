module.exports = {
	extends: "eslint:recommended",
	parser: "@babel/eslint-parser",
	parserOptions: {
		sourceType: "module",
		allowImportExportEverywhere: false,
		ecmaFeatures: {
			globalReturn: false,
		},
		// babelOptions: {
		// 	configFile: "path/to/config.js",
		// },
	},
	env: {
		es6: true,
		node: true,
		browser: true
	}
};
