
import { zodToTs, printNode } from 'zod-to-ts'
import { schema } from './schema';
console.log(printNode(zodToTs(schema).node));
