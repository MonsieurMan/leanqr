module.exports = {
	extends: ["eslint:recommended", "prettier"],
	parser: "@babel/eslint-parser",
	parserOptions: {
		sourceType: "module",
		allowImportExportEverywhere: false,
		ecmaFeatures: {
			globalReturn: false,
		},
	},
	env: {
		es6: true,
		node: true,
		browser: true,
	},
};
