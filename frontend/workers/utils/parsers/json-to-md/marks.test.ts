import { describe, it } from 'vitest';
import { createBlockParser } from '~/workers/utils/parsers/json-to-md/block';
import { createInlineParser } from '~/workers/utils/parsers/json-to-md/inline';
import { createMarksParser } from '~/workers/utils/parsers/json-to-md/marks';

describe('json-to-md/marks', () => {
    const config = {
        vault: {
            id: 'vault-id',
            name: 'vault-name',
            filepath: 'vault-path',
        },
        vaultId: 'vault-id',
        blockend: '\n\n',
        paragraph: {
            skipEndline: false,
            endline: '\n',
        },
        list: {},
        inline: {
            parse: createInlineParser(),
            extensions: [],
        },
        block: {
            parse: createBlockParser(),
            extensions: [],
        },
        marks: {
            parse: createMarksParser(),
            extensions: [],
        },
    };
    const paragraph = (text: string = '', marks: any[] = []) => ({
        type: 'paragraph',
        content: [
            {
                type: 'text',
                text,
                marks,
            },
        ],
    });

    it('should parse paragraph with bold', async ({ expect }) => {
        const content = [
            paragraph('Hello world', [
                {
                    type: 'bold',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('**Hello world**\n');
    });

    it('should parse paragraph with italic', async ({ expect }) => {
        const content = [
            paragraph('Hello world', [
                {
                    type: 'italic',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('*Hello world*\n');
    });

    it('should parse paragraph with code', async ({ expect }) => {
        const content = [
            paragraph('Hello world', [
                {
                    type: 'code',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('`Hello world`\n');
    });

    it('should parse paragraph with strikethrough', async ({ expect }) => {
        const content = [
            paragraph('Hello world', [
                {
                    type: 'strike',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('~~Hello world~~\n');
    });

    it('should parse paragraph with kbd', async ({ expect }) => {
        const content = [
            paragraph('Shift', [
                {
                    type: 'kbd',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('<kbd>Shift</kbd>\n');
    });

    it('should parse paragraph with link', async ({ expect }) => {
        const content = [
            paragraph('Hello world', [
                {
                    type: 'link',
                    attrs: {
                        href: 'https://example.com',
                    },
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('[Hello world](https://example.com)\n');
    });

    it('should parse paragraph with image', async ({ expect }) => {
        const content = [
            paragraph('Hello world', [
                {
                    type: 'image',
                    attrs: {
                        src: 'https://example.com',
                    },
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('![Hello world](https://example.com)\n');
    });

    it('should parse paragraph with highlight', async ({ expect }) => {
        const content = [
            paragraph('Hello world', [
                {
                    type: 'highlight',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('==Hello world==\n');
    });
});
