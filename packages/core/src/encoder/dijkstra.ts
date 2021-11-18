/******************************************************************************
 * Created 2008-08-19.
 *
 * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
 *
 * Copyright (C) 2008
 *   Wyatt Baldwin <self@wyattbaldwin.com>
 *   All rights reserved
 *
 * Licensed under the MIT license.
 *
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *****************************************************************************/

export interface Graph {
	[key: string]: {
		[key: string]: number;
	};
}

export function singleSourceShortestPaths(
	graph: Graph,
	s: string | number,
	d?: string | number
) {
	// Predecessor map for each node that has been encountered.
	// node ID => predecessor node ID
	let predecessors: { [key: string | number]: number | string } = {};

	// Costs of shortest paths from s to all nodes encountered.
	// node ID => cost
	let costs: {
		[key: number | string]: number;
	} = {};
	costs[s] = 0;

	// Costs of shortest paths from s to all nodes encountered; differs from
	// `costs` in that it provides easy access to the node that currently has
	// the known shortest path from s.
	// XXX: Do we actually need both `costs` and `open`?
	let open = new PriorityQueue();
	open.push(s, 0);

	let closest,
		u,
		v,
		cost_of_s_to_u,
		adjacent_nodes,
		cost_of_e,
		cost_of_s_to_u_plus_cost_of_e,
		cost_of_s_to_v,
		first_visit;

	while (!open.empty()) {
		// In the nodes remaining in graph that have a known cost from s,
		// find the node, u, that currently has the shortest path from s.
		closest = open.pop() as Item;
		u = closest.value;
		cost_of_s_to_u = closest.cost;

		// Get nodes adjacent to u...
		adjacent_nodes = graph[u] || {};

		// ...and explore the edges that connect u to those nodes, updating
		// the cost of the shortest paths to any or all of those nodes as
		// necessary. v is the node across the current edge from u.
		for (v in adjacent_nodes) {
			if (adjacent_nodes.hasOwnProperty(v)) {
				// Get the cost of the edge running from u to v.
				cost_of_e = adjacent_nodes[v];

				// Cost of s to u plus the cost of u to v across e--this is *a*
				// cost from s to v that may or may not be less than the current
				// known cost to v.
				cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

				// If we haven't visited v yet OR if the current known cost from s to
				// v is greater than the new cost we just found (cost of s to u plus
				// cost of u to v across e), update v's cost in the cost list and
				// update v's predecessor in the predecessor list (it's now u).
				cost_of_s_to_v = costs[v];
				first_visit = typeof costs[v] === 'undefined';
				if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
					costs[v] = cost_of_s_to_u_plus_cost_of_e;
					open.push(v, cost_of_s_to_u_plus_cost_of_e);
					predecessors[v] = u;
				}
			}
		}
	}

	if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
		let msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
		throw new Error(msg);
	}

	return predecessors;
}

export function extractShortestPathFromPredecessorList(
	predecessors: { [key: number | string]: number | string },
	d?: number | string
) {
	let nodes = [];
	let u = d;
	// let predecessor;
	while (u) {
		nodes.push(u);
		// predecessor = predecessors[u];
		u = predecessors[u];
	}
	nodes.reverse();
	return nodes;
}

export function findPath(graph: Graph, s: string, d?: string) {
	let predecessors = singleSourceShortestPaths(graph, s, d);
	return extractShortestPathFromPredecessorList(predecessors, d);
}

interface Item {
	cost: number;
	value: any;
}

type CompareFn = (a: Item, b: Item) => number;

/**
 * A very naive priority queue implementation.
 */
class PriorityQueue {
	queue: Item[] = [];
	sorter: CompareFn = PriorityQueue.default_sorter;

	static default_sorter(a: Item, b: Item) {
		return a.cost - b.cost;
	}

	/**
	 * Add a new item to the queue and ensure the highest priority element
	 * is at the front of the queue.
	 */
	push(value: number | string, cost: number) {
		let item = { value: value, cost: cost };
		this.queue.push(item);
		this.queue.sort(this.sorter);
	}

	/**
	 * Return the highest priority element in the queue.
	 */
	pop() {
		return this.queue.shift();
	}

	empty() {
		return this.queue.length === 0;
	}
}
