import { extensions as inlineExtensions } from './inline';
import { extensions as blockExtensions } from './block';

export const mdParserExtensions = [...blockExtensions, ...inlineExtensions];
