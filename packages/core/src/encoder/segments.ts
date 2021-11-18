import * as Mode from './mode.js';
import { NumericData } from '../data/numeric-data.js';
import { AlphanumericData } from '../data/alphanumeric-data.js';
import { ByteData } from '../data/byte-data.js';
import { KanjiData } from '../data/kanji-data.js';
import * as Regex from '../data/regex.js';
import * as Utils from './utils.js';

import { findPath } from './dijkstra.js';
import { Data, DataAbstractClass } from '../data/data.js';

/**
 * Returns UTF8 byte length
 *
 * @param  {String} str Input string
 * @return {Number}     Number of byte
 */
function getStringByteLength(str: string): number {
	// TODO: TextEncode must provide a more perfomant solution
	return unescape(encodeURIComponent(str)).length;
}
/**
 * Get a list of segments of the specified mode
 * from a string
 *
 * @param  {Mode}   mode Segment mode
 * @param  {String} str  String to process
 * @return {Array}       Array of object with segments data
 */
function getSegments(regex: RegExp, mode: Mode.Mode, str: string): Array<Data> {
	const segments = [];
	let result;
	while ((result = regex.exec(str)) !== null) {
		segments.push({
			data: result[0],
			index: result.index,
			mode: mode,
			length: result[0].length,
		});
	}
	return segments;
}
/**
 * Extracts a series of segments with the appropriate
 * modes from a string
 *
 * @param  {String} dataStr Input string
 * @return {Array}          Array of object with segments data
 */
function getSegmentsFromString(dataStr: string): Array<Data> {
	const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
	const alphaNumSegs = getSegments(
		Regex.ALPHANUMERIC,
		Mode.ALPHANUMERIC,
		dataStr
	);
	let byteSegs: Data[];
	let kanjiSegs: Data[];

	if (Utils.isKanjiModeEnabled()) {
		byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
		kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
	} else {
		byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
		kanjiSegs = [];
	}
	const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
	return segs
		.sort(function (s1, s2) {
			return s1.index - s2.index;
		})
		.map(function (obj) {
			return {
				data: obj.data,
				mode: obj.mode,
				length: obj.length,
				index: 0, // FIXME: Added index as duck typing
			};
		});
}

/**
 * Returns how many bits are needed to encode a string of
 * specified length with the specified mode
 *
 * @param  {Number} length String length
 * @param  {Mode} mode     Segment mode
 * @return {Number}        Bit length
 */
function getSegmentBitsLength(length: number, mode: Mode.Mode): number {
	switch (mode) {
		case Mode.NUMERIC:
			return NumericData.getBitsLength(length);
		case Mode.ALPHANUMERIC:
			return AlphanumericData.getBitsLength(length);
		case Mode.KANJI:
			return KanjiData.getBitsLength(length);
		case Mode.BYTE:
			return ByteData.getBitsLength(length);
		default:
			throw new Error('Unknown mode ' + mode);
	}
}

/**
 * Merges adjacent segments which have the same mode
 *
 * @param  {Array} segs Array of object with segments data
 * @return {Array}      Array of object with segments data
 */
function mergeSegments(segs: Array<Data>): Array<Data> {
	return segs.reduce((acc, curr) => {
		const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
		if (prevSeg && prevSeg.mode === curr.mode) {
			acc[acc.length - 1].data += curr.data;
			return acc;
		}
		acc.push(curr);
		return acc;
	}, [] as Array<Data>);
}

/**
 * Generates a list of all possible nodes combination which
 * will be used to build a segments graph.
 *
 * Nodes are divided by groups. Each group will contain a list of all the modes
 * in which is possible to encode the given text.
 *
 * For example the text '12345' can be encoded as Numeric, Alphanumeric or Byte.
 * The group for '12345' will contain then 3 objects, one for each
 * possible encoding mode.
 *
 * Each node represents a possible segment.
 *
 * @param  {Array} segs Array of object with segments data
 * @return {Array}      Array of object with segments data
 */
function buildNodes(segs: Array<Data>): Array<Array<Data>> {
	const nodes = [];
	for (let i = 0; i < segs.length; i++) {
		const seg = segs[i];
		switch (seg.mode) {
			case Mode.NUMERIC:
				nodes.push([
					seg,
					{ data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length, index: 0 },
					{ data: seg.data, mode: Mode.BYTE, length: seg.length, index: 0 },
				]);
				break;
			case Mode.ALPHANUMERIC:
				nodes.push([
					seg,
					{ data: seg.data, mode: Mode.BYTE, length: seg.length, index: 0 },
				]);
				break;
			case Mode.KANJI:
				nodes.push([
					seg,
					{
						data: seg.data,
						mode: Mode.BYTE,
						length: getStringByteLength(seg.data),
						index: 0,
					},
				]);
				break;
			case Mode.BYTE:
				nodes.push([
					{
						data: seg.data,
						mode: Mode.BYTE,
						length: getStringByteLength(seg.data),
						index: 0,
					},
				]);
		}
	}
	return nodes;
}

interface GraphInt {
	start: {};
	[key: string]: {
		[key: string]: number;
	};
}

export interface Graph {
	map: GraphInt;
	table: Table;
}

interface Table {
	[key: string]: { node: Data; lastCount: number };
}

/**
 * Builds a graph from a list of nodes.
 * All segments in each node group will be connected with all the segments of
 * the next group and so on.
 *
 * At each connection will be assigned a weight depending on the
 * segment's byte length.
 *
 * @param  {Array} nodes    Array of object with segments data
 * @param  {Number} version QR Code version
 * @return {Object}         Graph of all possible segments
 */
function buildGraph(nodes: Array<Array<Data>>, version: number): Graph {
	const table: Table = {};
	const graph: GraphInt = { start: {} };
	let prevNodeIds = ['start'];

	for (let i = 0; i < nodes.length; i++) {
		const nodeGroup = nodes[i];
		const currentNodeIds = [];
		for (let j = 0; j < nodeGroup.length; j++) {
			const node = nodeGroup[j];
			const key = '' + i + j;
			currentNodeIds.push(key);
			table[key] = { node: node, lastCount: 0 };
			graph[key] = {};

			for (let n = 0; n < prevNodeIds.length; n++) {
				const prevNodeId = prevNodeIds[n];
				if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
					graph[prevNodeId][key] =
						getSegmentBitsLength(
							table[prevNodeId].lastCount + node.length,
							node.mode
						) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
					table[prevNodeId].lastCount += node.length;
				} else {
					if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
					graph[prevNodeId][key] =
						getSegmentBitsLength(node.length, node.mode) +
						4 +
						Mode.getCharCountIndicator(node.mode, version); // switch cost
				}
			}
		}
		prevNodeIds = currentNodeIds;
	}

	for (let n = 0; n < prevNodeIds.length; n++) {
		graph[prevNodeIds[n]].end = 0;
	}

	return { map: graph, table };
}
/**
 * Builds a segment from a specified data and mode.
 * If a mode is not specified, the more suitable will be used.
 *
 * @param  {String} data             Input data
 * @param  {Mode | String} modesHint Data mode
 * @return {Segment}                 Segment
 */
function buildSingleSegment(
	data: string,
	modesHint: string | Mode.Mode
): DataAbstractClass {
	let mode;
	const bestMode = Mode.getBestModeForData(data);
	mode = Mode.from(modesHint, bestMode);

	// Make sure data can be encoded
	if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
		throw new Error(
			'"' +
				data +
				'"' +
				' cannot be encoded with mode ' +
				Mode.toString(mode) +
				'.\n Suggested mode is: ' +
				Mode.toString(bestMode)
		);
	}

	// Use Mode.BYTE if Kanji support is disabled
	if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
		mode = Mode.BYTE;
	}
	switch (mode) {
		case Mode.NUMERIC:
			return new NumericData(data);
		case Mode.ALPHANUMERIC:
			return new AlphanumericData(data);
		case Mode.KANJI:
			return new KanjiData(data);
		case Mode.BYTE:
			return new ByteData(data);
		default:
			throw new Error('Unknown mode ' + mode);
	}
}
export function fromArray(array: Array<Data | string>) {
	return array.reduce(function (acc, seg) {
		if (typeof seg === 'string') {
			acc.push(buildSingleSegment(seg, 'fuck this codebase'));
		} else if (seg.data) {
			acc.push(buildSingleSegment(seg.data, seg.mode));
		}
		return acc;
	}, [] as DataAbstractClass[]);
}

export function fromString(data: string, version: number) {
	const segs = getSegmentsFromString(data);
	const nodes = buildNodes(segs);
	const graph = buildGraph(nodes, version);
	const path = findPath(graph.map, 'start', 'end');
	const optimizedSegs = [];
	for (let i = 1; i < path.length - 1; i++) {
		optimizedSegs.push(graph.table[path[i]].node);
	}
	return fromArray(mergeSegments(optimizedSegs));
}

export function rawSplit(data: string): Array<DataAbstractClass> {
	return fromArray(getSegmentsFromString(data));
}
