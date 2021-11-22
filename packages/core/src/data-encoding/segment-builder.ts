/**
 * Segments are sequence of data encoded according to the rules
 * of one ECI or encodation mode.
 */

import * as Mode from './mode.js';

import { NumericSegment } from './segments/numeric-segment.js';
import { AlphanumericSegment } from './segments/alphanumeric-segment.js';
import { ByteSegment } from './segments/byte-segment.js';
import { KanjiSegment } from './segments/kanji-segment.js';
import { Segment, SegmentAbstract } from './segment.js';

import * as Regex from './regex.js';
import * as Utils from '../encoder/utils.js';

import { findPath } from './dijkstra.js';

export function fromArray(array: Array<Partial<Segment> | string>) {
	return array.reduce(function (acc, seg) {
		if (typeof seg === 'string') {
			acc.push(buildSingleSegment(seg, 'fuck this codebase'));
		} else if (seg.data) {
			acc.push(buildSingleSegment(seg.data, seg.mode));
		}
		return acc;
	}, [] as SegmentAbstract[]);
}

export function fromString(
	data: string,
	version: number
): Array<SegmentAbstract> {
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

export function rawSplit(data: string): Array<SegmentAbstract> {
	return fromArray(getSegmentsFromString(data));
}

/**
 * Returns UTF8 byte length.
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
 * from a string.
 *
 * @param  {Mode}   mode Segment mode
 * @param  {String} str  String to process
 * @return {Array}       Array of object with segments data
 */
function getSegments(
	regex: RegExp,
	mode: Mode.Mode,
	str: string
): Array<Segment> {
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
function getSegmentsFromString(dataStr: string): Array<Segment> {
	const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
	const alphaNumSegs = getSegments(
		Regex.ALPHANUMERIC,
		Mode.ALPHANUMERIC,
		dataStr
	);
	let byteSegs: Segment[];
	let kanjiSegs: Segment[];

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
			return NumericSegment.getBitsLength(length);
		case Mode.ALPHANUMERIC:
			return AlphanumericSegment.getBitsLength(length);
		case Mode.KANJI:
			return KanjiSegment.getBitsLength(length);
		case Mode.BYTE:
			return ByteSegment.getBitsLength(length);
		default:
			throw new Error('Unknown mode ' + mode);
	}
}

/**
 * Merges adjacent segments which have the same mode.
 *
 * @param  {Array} segs Array of object with segments data
 * @return {Array}      Array of object with segments data
 */
function mergeSegments(segs: Array<Segment>): Array<Segment> {
	const mergeSegment = (acc: Segment[], currentSegment: Segment): Segment[] => {
		const previousSegment = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;

		if (currentSegment.mode === previousSegment?.mode) {
			// Previous and current segment have the same mode,
			// therefore we can merge them as one segment.
			acc[acc.length - 1].data += currentSegment.data;
		} else {
			// Else we do no merge
			acc.push(currentSegment);
		}

		return acc;
	};

	return segs.reduce(mergeSegment, [] as Array<Segment>);
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
 * @return {Array}      Array of array with segments data
 */
function buildNodes(segs: Array<Segment>): Array<Array<Segment>> {
	const nodes: Array<Array<Segment>> = [];

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
	[key: string]: {
		node: Segment;
		lastCount: number;
	};
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
function buildGraph(nodes: Array<Array<Segment>>, version: number): Graph {
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
					if (table[prevNodeId]) {
						table[prevNodeId].lastCount = node.length;
					}
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
 * TODO: get rid of the Mode|String
 * @param  {String} data             Input data
 * @param  {Mode | String} modesHint Data mode
 * @return {Segment}                 Segment
 */
function buildSingleSegment(
	data: string,
	modesHint?: string | Mode.Mode
): SegmentAbstract {
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

	// FIXME: Global is kanjiModeEnabled state.
	// Use Mode.BYTE if Kanji support is disabled
	if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
		mode = Mode.BYTE;
	}

	switch (mode) {
		case Mode.NUMERIC:
			return new NumericSegment(data);
		case Mode.ALPHANUMERIC:
			return new AlphanumericSegment(data);
		case Mode.KANJI:
			return new KanjiSegment(data);
		case Mode.BYTE:
			return new ByteSegment(data);
		default:
			throw new Error('Unknown mode ' + mode);
	}
}


