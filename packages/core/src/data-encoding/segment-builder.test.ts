import tap from 'tap';
import * as Mode from './mode.js';
import * as Segments from './segment-builder.js';
import { NumericSegment } from './segments/numeric-segment.js';
import { AlphanumericSegment } from './segments/alphanumeric-segment.js';
import { ByteSegment } from './segments/byte-segment.js';
// import toSJIS from "../../../dist/esm/helper/to-sjis.js";
// import * as Utils from "../../encoder/utils.js";

const test = tap.test;
// let testData = [
// 	{
// 		input: "1A1",
// 		result: [{ data: "1A1", mode: Mode.ALPHANUMERIC }],
// 	},
// 	{
// 		input: "a-1-b-2?",
// 		result: [{ data: "a-1-b-2?", mode: Mode.BYTE }],
// 	},
// 	{
// 		input: "AB123456CDF",
// 		result: [{ data: "AB123456CDF", mode: Mode.ALPHANUMERIC }],
// 	},
// 	{
// 		input: "aABC000000-?-----a",
// 		result: [
// 			{ data: "aABC", mode: Mode.BYTE },
// 			{ data: "000000", mode: Mode.NUMERIC },
// 			{ data: "-?-----a", mode: Mode.BYTE },
// 		],
// 	},
// 	{
// 		input: "aABC000000A?",
// 		result: [
// 			{ data: "aABC", mode: Mode.BYTE },
// 			{ data: "000000", mode: Mode.NUMERIC },
// 			{ data: "A?", mode: Mode.BYTE },
// 		],
// 	},
// 	{
// 		input: "a1234ABCDEF?",
// 		result: [
// 			{ data: "a", mode: Mode.BYTE },
// 			{ data: "1234ABCDEF", mode: Mode.ALPHANUMERIC },
// 			{ data: "?", mode: Mode.BYTE },
// 		],
// 	},
// 	{
// 		input: "12345A12345",
// 		result: [{ data: "12345A12345", mode: Mode.ALPHANUMERIC }],
// 	},
// 	{
// 		input: "aABCDEFGHILMNa",
// 		result: [
// 			{ data: "a", mode: Mode.BYTE },
// 			{ data: "ABCDEFGHILMN", mode: Mode.ALPHANUMERIC },
// 			{ data: "a", mode: Mode.BYTE },
// 		],
// 	},
// 	{
// 		input: "Aa12345",
// 		result: [
// 			{ data: "Aa", mode: Mode.BYTE },
// 			{ data: "12345", mode: Mode.NUMERIC },
// 		],
// 	},
// 	{
// 		input: "a1A2B3C4D5E6F4G7",
// 		result: [
// 			{ data: "a", mode: Mode.BYTE },
// 			{ data: "1A2B3C4D5E6F4G7", mode: Mode.ALPHANUMERIC },
// 		],
// 	},
// 	{
// 		input: "123456789QWERTYUIOPASD",
// 		result: [
// 			{ data: "123456789", mode: Mode.NUMERIC },
// 			{ data: "QWERTYUIOPASD", mode: Mode.ALPHANUMERIC },
// 		],
// 	},
// 	{
// 		input: "QWERTYUIOPASD123456789",
// 		result: [
// 			{ data: "QWERTYUIOPASD", mode: Mode.ALPHANUMERIC },
// 			{ data: "123456789", mode: Mode.NUMERIC },
// 		],
// 	},
// 	{
// 		input: "ABCDEF123456a",
// 		result: [
// 			{ data: "ABCDEF123456", mode: Mode.ALPHANUMERIC },
// 			{ data: "a", mode: Mode.BYTE },
// 		],
// 	},
// 	{
// 		input: "abcdefABCDEF",
// 		result: [
// 			{ data: "abcdef", mode: Mode.BYTE },
// 			{ data: "ABCDEF", mode: Mode.ALPHANUMERIC },
// 		],
// 	},
// 	{
// 		input: "a123456ABCDEa",
// 		result: [
// 			{ data: "a", mode: Mode.BYTE },
// 			{ data: "123456ABCDE", mode: Mode.ALPHANUMERIC },
// 			{ data: "a", mode: Mode.BYTE },
// 		],
// 	},
// 	{
// 		input: "AAAAA12345678?A1A",
// 		result: [
// 			{ data: "AAAAA", mode: Mode.ALPHANUMERIC },
// 			{ data: "12345678", mode: Mode.NUMERIC },
// 			{ data: "?A1A", mode: Mode.BYTE },
// 		],
// 	},
// 	{
// 		input: "Aaa",
// 		result: [{ data: "Aaa", mode: Mode.BYTE }],
// 	},
// 	{
// 		input: "Aa12345A",
// 		result: [
// 			{ data: "Aa", mode: Mode.BYTE },
// 			{ data: "12345A", mode: Mode.ALPHANUMERIC },
// 		],
// 	},
// 	{
// 		input: "ABC\nDEF",
// 		result: [{ data: "ABC\nDEF", mode: Mode.BYTE }],
// 	},
// ];
// const kanjiTestData = [
// 	{
// 		input: "乂ЁЖぞβ",
// 		result: [{ data: "乂ЁЖぞβ", mode: Mode.KANJI }],
// 	},
// 	{
// 		input: "ΑΒΓψωЮЯабв",
// 		result: [{ data: "ΑΒΓψωЮЯабв", mode: Mode.KANJI }],
// 	},
// 	{
// 		input: "皿a晒三",
// 		result: [
// 			{ data: "皿a", mode: Mode.BYTE },
// 			{ data: "晒三", mode: Mode.KANJI },
// 		],
// 	},
// 	{
// 		input: "皿a\n晒三",
// 		result: [
// 			{ data: "皿a\n", mode: Mode.BYTE },
// 			{ data: "晒三", mode: Mode.KANJI },
// 		],
// 	},
// ];

// testData = testData.concat(kanjiTestData);
test('Segments from array', function (t) {
	t.same(
		Segments.fromArray(['abcdef', '12345']),
		[new ByteSegment('abcdef'), new NumericSegment('12345')],
		'Should return correct segment from array of string'
	);
	t.same(
		Segments.fromArray([
			{ data: 'abcdef', mode: Mode.BYTE, index: 0, length: 0 },
			{ data: '12345', mode: Mode.NUMERIC, index: 0, length: 0 },
		]),
		[new ByteSegment('abcdef'), new NumericSegment('12345')],
		'Should return correct segment from array of objects'
	);

	t.same(
		Segments.fromArray([{ data: 'abcdef' }, { data: '12345' }]),
		[new ByteSegment('abcdef'), new NumericSegment('12345')],
		'Should return correct segment from array of objects if mode is not specified'
	);
	t.same(Segments.fromArray([{}]), [], 'Should return an empty array');
	t.throws(function () {
		Segments.fromArray([{ data: 'ABCDE', mode: Mode.NUMERIC }]);
	}, 'Should throw if segment cannot be encoded with specified mode');
	t.same(
		Segments.fromArray([{ data: '０１２３', mode: Mode.KANJI }]),
		[new ByteSegment('０１２３')],
		'Should use Byte mode if kanji support is disabled'
	);
	t.end();
});

// FIXME: Disabled test.
// test("Segments optimization", function (t) {
// I don't understand the link between kanji support
// And the fact that fromString and fromArray should yield the same result
// t.same(
// 	Segments.fromString("乂ЁЖ", 1),
// 	Segments.fromArray([{ data: "乂ЁЖ", mode: "byte" }]),
// 	"Should use Byte mode if Kanji support is disabled"
// );
// Utils.setToSJISFunction(toSJIS);
// testData.forEach((data) =>
// 	t.same(Segments.fromString(data.input, 1), Segments.fromArray(data.result))
// );
// t.end();
// });

test('Segments raw split', function (t) {
	const splitted = [
		new ByteSegment('abc'),
		new AlphanumericSegment('DEF'),
		new NumericSegment('123'),
	];
	t.same(Segments.rawSplit('abcDEF123'), splitted);
	t.end();
});
