import { detectNewline } from 'detect-newline';
// @ts-ignore
import createDOMPurify from 'dompurify/dist/purify.es.js';
// @ts-ignore
import { parseHTML } from 'linkedom/worker';
import { ServiceKey } from '~/constants';
const { window } = parseHTML('<!DOCTYPE html><body>');
const DOMPurify = createDOMPurify(window);

const anonymize = (input: string) => {
    return input
        .replaceAll(/\w/g, () => {
            return String.fromCharCode(
                'a'.charCodeAt(0) + Math.floor(Math.random() * 26),
            );
        })
        .replaceAll(/\d/g, () => {
            return `${Math.floor(Math.random() * 10)}`;
        });
};

export const extensionErrorWrapper = (
    fn: () => any,
    input?: string,
    type?: string,
    config?: any,
) => {
    try {
        return fn();
    } catch (e: any) {
        e.message += ` Extension: ${type}. Input: ${anonymize(input ?? '')}`;
        config?.context?.emit(ServiceKey.SENTRY, 'trackError', e);
        console.error(e);
    }
};

export const getContentNewLine = (data: string, config: any) => {
    return (typeof data === 'string' && detectNewline(data)) || config.endline;
};

export const parseEmptyLines = (data: string, config: any) => {
    const splitData = data.split(config.endline);
    let codeblock = false;
    let katexBlock = false;
    return splitData
        .map((line: string) => {
            if (line.startsWith('```') && !katexBlock) {
                codeblock = !codeblock;
            }
            if (line.startsWith('$$') && !codeblock) {
                katexBlock = !katexBlock;
            }

            if (codeblock || katexBlock) {
                return line;
            }

            if (line.trim().length === 0) {
                return `${config.endline}&nbsp;${config.endline}`;
            }

            return line;
        })
        .join(config.endline);
};

export const replaceBR = (output: string, config: any): string => {
    const fixedParagraphs = output
        .split('</p>')
        .map(line => line.replaceAll('<br>', '</p><p>'))
        .join('</p>');
    const splitHTML = fixedParagraphs.split('><');

    return splitHTML
        .map(part => {
            const tag = part
                .split('<')
                .pop()
                ?.split(' ')
                .shift()
                ?.replace('/', '');
            if (part.endsWith('</code')) {
                return part;
            }
            return part
                .replaceAll(config.endline, '<br>')
                .replaceAll('\n', '<br>')
                .replaceAll('<br>', `</${tag}><${tag}>`);
        })
        ?.join('><');
};

export const processOutput = (output: string, config: any): string => {
    output = output.replace(/(?:&amp;)?&?nbsp;/g, '');
    output = output.replace(/(<\/?[^>]*>)\n/gm, '$1');

    output = DOMPurify.sanitize(output);
    output = replaceBR(output, config);
    output = output = output.replace(/<br>/gi, ' ');
    output = output.replace(/(<\/(?:ul|ol|blockquote)>)<p><\/p>/g, '$1');
    return output;
};
