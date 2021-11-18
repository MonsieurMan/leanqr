import { render } from './dist/index.js';
import { encode } from '@leanqr/core/dist/index.js';

console.log(render(encode('test')));
