import { describe, it } from 'vitest';
import * as helpers from '../helpers';
import { StorageType } from '../storage';
import { createBlockParser } from '~/workers/utils/parsers/json-to-md/block';
import { createInlineParser } from '~/workers/utils/parsers/json-to-md/inline';
import { createMarksParser } from '~/workers/utils/parsers/json-to-md/marks';
import { EntityStorage } from '~/workers/utils/parsers';
import { JiraIntegrationDataType } from '~/constants/jira';

const vault = {
    id: 'vault-id',
    name: 'vault-name',
    filepath: '/vault/path/',
};

describe('json-to-md/block windows', () => {
    const windowsConfig = {
        os: 'windows',
        vault: {
            ...vault,
            filepath: 'C:\\Users\\user\\Documents\\acreom\\',
        },
        sep: '\\',
    };
    runTests(windowsConfig);
});

describe('json-to-md/block linux', () => {
    const linuxConfig = {
        os: 'linux',
        vault: {
            ...vault,
            filepath: '/home/user/Documents/acreom/',
        },
        sep: '/',
    };
    runTests(linuxConfig);
});

const runTests = (platformConfig: any) => {
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
        helpers,
        storage: new EntityStorage({ os: platformConfig.os } as any),
        ...platformConfig,
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

    const text = (text: string = '', marks: any[] = []) => ({
        type: 'text',
        text,
        marks,
    });

    const heading = (content: any[], level: number = 1) => ({
        type: 'heading',
        attrs: {
            level,
        },
        content,
    });

    const codeBlock = (content: any[], language: string = '') => ({
        type: 'codeBlock',
        attrs: {
            language,
        },
        content,
    });

    const blockquote = (content: any[]) => ({
        type: 'blockquote',
        content,
    });

    const mermaid = (expression: string) => ({
        type: 'mermaid-component',
        attrs: {
            expression,
        },
    });

    const listItem = (content: any[]) => ({
        type: 'listItem',
        content,
    });

    const bulletList = (content: any[]) => ({
        type: 'bulletList',
        content,
    });

    const horizontalRule = () => ({
        type: 'horizontalRule',
    });

    const katex = (expression: string) => ({
        type: 'blockKatex',
        attrs: {
            expression,
        },
    });

    const jiraIssue = (id: string) => ({
        type: 'jira-issue',
        attrs: {
            id,
        },
    });

    it('should parse paragraph', async ({ expect }) => {
        const content = [paragraph('Hello world'), paragraph(), paragraph()];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('Hello world\n\n\n');
    });

    it('should parse paragraph with bold', async ({ expect }) => {
        const content = [
            paragraph('Hello world'),
            paragraph(),
            paragraph(),
            paragraph('Hello world', [
                {
                    type: 'bold',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('Hello world\n\n\n**Hello world**\n');
    });

    it('should parse paragraph with italic', async ({ expect }) => {
        const content = [
            paragraph('Hello world'),
            paragraph(),
            paragraph(),
            paragraph('Hello world', [
                {
                    type: 'italic',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('Hello world\n\n\n*Hello world*\n');
    });

    it('should parse paragraph with code', async ({ expect }) => {
        const content = [
            paragraph('Hello world'),
            paragraph(),
            paragraph(),
            paragraph('Hello world', [
                {
                    type: 'code',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('Hello world\n\n\n`Hello world`\n');
    });

    it('should parse paragraph with strikethrough', async ({ expect }) => {
        const content = [
            paragraph('Hello world'),
            paragraph(),
            paragraph(),
            paragraph('Hello world', [
                {
                    type: 'strike',
                    attrs: {},
                },
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('Hello world\n\n\n~~Hello world~~\n');
    });

    it('should parse paragraph with link', async ({ expect }) => {
        const content = [
            paragraph('Hello world'),
            paragraph(),
            paragraph(),
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
        expect(result).toEqual(
            'Hello world\n\n\n[Hello world](https://example.com)\n',
        );
    });

    it('should parse bullet list', async ({ expect }) => {
        const content = [
            bulletList([
                listItem([paragraph('Hello world')]),
                listItem([
                    paragraph('Hello world'),
                    bulletList([listItem([paragraph('Hello world')])]),
                ]),
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual(
            '- Hello world\n- Hello world\n    - Hello world\n\n',
        );
    });

    it('should parse bullet list with empty list item', async ({ expect }) => {
        const content = [
            bulletList([
                listItem([paragraph('Hello world')]),
                listItem([paragraph()]),
                listItem([
                    paragraph('Hello world'),
                    bulletList([listItem([paragraph('Hello world')])]),
                ]),
            ]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual(
            '- Hello world\n- \n- Hello world\n    - Hello world\n\n',
        );
    });

    it('should parse codeblock', async ({ expect }) => {
        const content = [
            codeBlock([text('Hello world')]),
            codeBlock([text('Hello world')], 'javascript'),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual(
            '```\nHello world\n```\n```javascript\nHello world\n```\n',
        );
    });

    it('should parse codeblock with empty content', async ({ expect }) => {
        const content = [codeBlock([text()])];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('```\n\n```\n');
    });

    it('should parse horizontal rule', async ({ expect }) => {
        const content = [horizontalRule()];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('---\n\n');
    });

    it('should parse blockquote', async ({ expect }) => {
        const content = [blockquote([paragraph('Hello world 1')])];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('> Hello world 1\n\n');
    });

    it('should parse multiline blockquote', async ({ expect }) => {
        const content = [
            blockquote([paragraph('Hello world'), paragraph('Hello world')]),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('> Hello world\n> Hello world\n\n');
    });

    it('should parse mermaid component', async ({ expect }) => {
        const content = [mermaid('graph TD\nA-->B')];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('```mermaid\ngraph TD\nA-->B\n```\n');
    });

    it('should parse katex component', async ({ expect }) => {
        const content = [katex('c = \\pm\\sqrt{a^2 + b^2}')];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('$$\nc = \\pm\\sqrt{a^2 + b^2}\n$$\n');
    });

    it('should parse jira issue component', async ({ expect }) => {
        config.storage.set(config.vault.id, StorageType.INTEGRATION_DATA, {
            id: 'jira_issueB/123',
            filepath: 'jira:ACR-123',
            key: 'ACR-123',
            type: JiraIntegrationDataType.ISSUE,
        });
        const content = [
            paragraph('textik1'),
            jiraIssue('jira_issueB/123'),
            paragraph('textik2'),
        ];
        const result = await config.block.parse(content, config);
        expect(result).toEqual('textik1\n[[jira:ACR-123]]\ntextik2\n');
    });
};
