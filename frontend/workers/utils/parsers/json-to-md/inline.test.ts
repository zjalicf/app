import { describe, it } from 'vitest';
import * as helpers from '../helpers';
import { EntityStorage, StorageType } from '../storage';
import { createBlockParser } from '~/workers/utils/parsers/json-to-md/block';
import { createInlineParser } from '~/workers/utils/parsers/json-to-md/inline';
import { createMarksParser } from '~/workers/utils/parsers/json-to-md/marks';

const vault = {
    id: 'vault-id',
    name: 'vault-name',
    filepath: '/vault/path/',
};

describe('json-to-md/inline windows', () => {
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

describe('json-to-md/inline linux', () => {
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
    const inlineConfig = {
        vault,
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
        entities: {},
        helpers,
        storage: new EntityStorage({ os: platformConfig.os } as any),
        ...platformConfig,
    } as any;

    const paragraph = (content: any[]) => ({
        type: 'paragraph',
        content,
    });
    const text = (text: string = '', marks: any[] = []) => ({
        type: 'text',
        text,
        marks,
    });

    const hashtag = (id: string) => ({
        type: 'hashtag',
        attrs: {
            id,
        },
    });

    const inlineDocumentLink = (id: string, preview = false, oc = '') => ({
        type: 'inlineDocumentLink',
        attrs: {
            id,
            preview,
            oc,
        },
    });

    const inlineEvent = (id: string) => ({
        type: 'inlineEvent',
        attrs: {
            id,
        },
    });

    const inlineKatex = (expression: string) => ({
        type: 'inlineKatex',
        attrs: {
            expression,
        },
    });

    it('should parse text', async ({ expect }) => {
        const content = [text('Hello world')];
        const result = await inlineConfig.inline.parse(content, inlineConfig);
        expect(result).toEqual('Hello world');
    });

    it('should parse hashtag', async ({ expect }) => {
        const content = [hashtag('hashtag-id')];
        const result = await inlineConfig.inline.parse(content, inlineConfig);
        expect(result).toEqual('#hashtag-id');
    });

    it('should parse inline document link', async ({ expect }) => {
        const content = [text('kek '), inlineDocumentLink('test-id')];
        inlineConfig.storage.set(inlineConfig.vault.id, StorageType.DOCUMENT, {
            id: 'test-id',
            title: 'Hello World',
            filepath: inlineConfig.vault.filepath + 'Hello World.md',
            type: 'document',
        });
        const result = await inlineConfig.inline.parse(content, inlineConfig);
        expect(result).toEqual('kek [[Hello World]]');
    });

    it('should parse inline document link with preview', async ({ expect }) => {
        const content = [text('kek '), inlineDocumentLink('test-id', true)];
        inlineConfig.storage.set(inlineConfig.vault.id, StorageType.DOCUMENT, {
            id: 'test-id',
            title: 'Hello World',
            filepath: inlineConfig.vault.filepath + 'Hello World.md',
            type: 'document',
        });

        const result = await inlineConfig.inline.parse(content, inlineConfig);
        expect(result).toEqual('kek ![[Hello World]]');
    });

    it('should parse inline document link with oc', async ({ expect }) => {
        const content = [
            text('kek '),
            inlineDocumentLink('test-id', false, '#kekos'),
        ];
        inlineConfig.storage.set(inlineConfig.vault.id, StorageType.DOCUMENT, {
            id: 'test-id',
            title: 'Hello World',
            filepath: inlineConfig.vault.filepath + 'Hello World.md',
            type: 'document',
        });

        const result = await inlineConfig.inline.parse(content, inlineConfig);
        expect(result).toEqual('kek [[Hello World#kekos]]');
    });

    it('should parse inline event', async ({ expect }) => {
        const content = [text('kek '), inlineEvent('test-id-123')];
        inlineConfig.storage.set(inlineConfig.vault.id, StorageType.EVENT, {
            id: 'test-id-123',
            title: 'Hello World Event',
            filepath:
                inlineConfig.vault.filepath +
                ['.events', 'Hello World Event.md'].join(inlineConfig.sep),
            type: 'event',
        });

        const result = await inlineConfig.inline.parse(content, inlineConfig);
        expect(result).toEqual('kek [[.events/Hello World Event]]');
    });

    it('should parse inline katex', async ({ expect }) => {
        const content = [text('kek '), inlineKatex('1 + 1')];
        const result = await inlineConfig.inline.parse(content, inlineConfig);
        expect(result).toEqual('kek $1 + 1$');
    });

    it('should parase document link with multiple selections', async ({
        expect,
    }) => {
        const content = [
            text('testicek ide nejde '),
            inlineDocumentLink('idA'),
            inlineDocumentLink('idB'),
        ];
        inlineConfig.storage.set(inlineConfig.vault.id, StorageType.DOCUMENT, [
            {
                id: 'idA',
                title: 'Hello Worlddd',
                filepath:
                    inlineConfig.vault.filepath +
                    ['folderA', 'Hello Worlddd.md'].join(inlineConfig.sep),
                type: 'document',
            },
            {
                id: 'idB',
                title: 'Hello Worlddd',
                filepath:
                    inlineConfig.vault.filepath +
                    ['folderB', 'Hello Worlddd.md'].join(inlineConfig.sep),
                type: 'document',
            },
        ]);
        const result = await inlineConfig.inline.parse(content, inlineConfig);
        expect(result).toEqual(
            'testicek ide nejde [[folderA/Hello Worlddd|Hello Worlddd]][[folderB/Hello Worlddd|Hello Worlddd]]',
        );
    });
};
