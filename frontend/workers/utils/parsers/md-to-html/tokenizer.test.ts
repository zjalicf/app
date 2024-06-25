import { describe, it } from 'vitest';
import {
    createMDParser,
    EntityStorage,
    StorageType,
} from '~/workers/utils/parsers';
import { JiraIntegrationDataType } from '~/constants/jira';

describe('md-to-html/tokenizer windows', () => {
    const vault = {
        id: 'vault-id',
        name: 'vault-name',
        filepath: 'C:\\Users\\user\\Documents\\acreom\\',
    };
    const windowsConfig = {
        $config: {
            os: 'windows',
        },
        vault,
        sep: '\\',
    };

    runTests(windowsConfig);
});

describe('md-to-html/tokenizer linux', () => {
    const vault = {
        id: 'vault-id',
        name: 'vault-name',
        filepath: '/home/user/Documents/acreom/',
    };
    const linuxConfig = {
        $config: {
            os: 'linux',
        },
        vault,
        sep: '/',
    };

    runTests(linuxConfig);
});

const runTests = (platformConfig: any) => {
    const config = {
        endline: '\n',
        sep: '/',
        entityPath: platformConfig.vault.filepath + 'abcd.md',
        entity: {
            vaultId: 'abcd',
            metadata: {
                id: '123e',
            },
        },
        vault: {
            id: 'abcd',
            filepath: '/vault/path',
        },
        tasks: { filepathIndex: [] },
        storage: new EntityStorage(platformConfig.$config as any),
        ...platformConfig,
    };

    config.storage.set(config.vault.id, StorageType.DOCUMENT, [
        {
            id: '123',
            title: 'Contexts',
            filepath:
                config.vault.filepath +
                ['Elixir', 'Contexts.md'].join(config.sep),
            vaultId: config.vault.id,
        },
        {
            id: '124',
            title: 'Schemas',
            filepath:
                config.vault.filepath +
                ['Elixir', 'Schemas.md'].join(config.sep),
            vaultId: config.vault.id,
        },
    ]);
    config.storage.set(config.vault.id, StorageType.VAULT, [config.vault]);

    const parse = createMDParser({
        ...config,
        emit: (..._args: any) => {},
        invoke: (..._args: any) => {},
    } as any);

    it('should tokenize paragraph with spaces', async ({ expect }) => {
        const content = '   abcdds\n  kekocina1\n kek\n   abcd';

        const result = await parse({ content } as any, config);

        expect(result).toEqual(
            '<p>   abcdds</p><p>  kekocina1</p><p> kek</p><p>   abcd</p>',
        );
    });

    it('should parse inline task with date and document link', async ({
        expect,
    }) => {
        const content =
            'abcdds\n- [ ] Hello world [[Elixir/Schemas]] start:datetime:1701871200000\n';
        const result = await parse(
            {
                content,
                vaultId: config.vault.id,
                filepath: config.entityPath,
            } as any,
            config,
        );
        expect(result.replace(/id="[^"]+"/, 'id="abcd"')).toEqual(
            '<p>abcdds</p><ul><li><div data-type="taskItemContent" id="abcd" completed="false" start="datetime:1701871200000">Hello world <inline-document-link id=\'124\'></inline-document-link></div></li></ul>',
        );
    });

    it('should parse inline task with start and end', async ({ expect }) => {
        const content =
            'abcdds\n- [ ] Hello world start:datetime:1701871200000 end:datetime:1701871200000\n';
        const result = await parse(
            {
                content,
                vaultId: config.vault.id,
                filepath: config.entityPath,
            } as any,
            config,
        );
        expect(result.replace(/id="[^"]+"/, 'id="abcd"')).toEqual(
            '<p>abcdds</p><ul><li><div data-type="taskItemContent" id="abcd" completed="false" start="datetime:1701871200000" end="datetime:1701871200000">Hello world</div></li></ul>',
        );
    });

    it('should parse inline task with start and end rrule', async ({
        expect,
    }) => {
        const content =
            'abcdds\n- [ ] Hello world start:datetime:1701871200000 end:datetime:1701871200000 rrule:abce:RRULE;FREQ=DAILY\n';
        const result = await parse(
            {
                content,
                vaultId: config.vault.id,
                filepath: config.entityPath,
            } as any,
            config,
        );
        expect(result).toEqual(
            '<p>abcdds</p><ul><li><div data-type="taskItemContent" id="abce" completed="false" start="datetime:1701871200000" end="datetime:1701871200000" rrule="RRULE;FREQ=DAILY">Hello world</div></li></ul>',
        );
    });

    it('should tokenize blockquote', async ({ expect }) => {
        const content = 'abcdds\nkekocina1\n> Hello world\n> kek\nabcd';

        const result = await parse({ content } as any, config);

        expect(result).toEqual(
            '<p>abcdds</p><p>kekocina1</p><blockquote><p>Hello world</p><p>kek</p><p>abcd</p></blockquote>',
        );
    });

    it('should tokenize code', async ({ expect }) => {
        const content = '```js\nconsole.log("Hello world");\n```';

        const result = await parse({ content } as any, config);

        expect(result).toEqual(
            String.raw`<pre><code class="hljs language-js">console.log("Hello world");</code></pre>`,
        );
    });
    it('should tokenize doclinks with shortest path', async ({ expect }) => {
        const content = `a\n[[Elixir/Schemas|Schemas]]\n[[Elixir/Contexts|Contexts]]\nb`;
        const result = await parse(
            {
                content,
                vaultId: config.vault.id,
                filepath: config.entityPath,
            } as any,
            config,
        );
        expect(result).toEqual(
            '<p>a</p>' +
                "<p><inline-document-link id='124' oc='|Schemas'></inline-document-link></p>" +
                "<p><inline-document-link id='123' oc='|Contexts'></inline-document-link></p>" +
                '<p>b</p>',
        );
    });
    it('should tokenize jiraIssue link', async ({ expect }) => {
        const content = `text\n[[jira:ACR-123]]\ntext123\n`;
        const jiraIssue = {
            id: 'jira_issueB/123',
            filepath: 'jira:ACR-123',
            key: 'ACR-123',
            type: JiraIntegrationDataType.ISSUE,
        };
        config.storage.set(
            config.vault.id,
            StorageType.INTEGRATION_DATA,
            jiraIssue,
        );
        const result = await parse(
            {
                content,
                vaultId: config.vault.id,
                filepath: config.entityPath,
            } as any,
            config,
        );

        expect(result).toEqual(
            '<p>text</p>' +
                `<jira-issue id='${jiraIssue.id}'></jira-issue>` +
                '<p>text123</p>' +
                '<p></p>',
        );
    });
};
