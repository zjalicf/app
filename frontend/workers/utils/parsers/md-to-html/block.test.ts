import { describe, it } from 'vitest';
import {
    createMDParser,
    EntityStorage,
    StorageType,
} from '~/workers/utils/parsers';

describe('md-to-html/block', () => {
    const vaultPath = '/vault/path/';
    const config = {
        endline: '\n',
        sep: '/',
        entityPath: '/vault/path/abcd.md',
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
        storage: new EntityStorage({ os: 'mac' } as any),
    };

    config.storage.set(config.vault.id, StorageType.VAULT, config.vault);

    const parse = createMDParser({
        $config: {
            os: 'linux',
        },
        ...config,
        emit: (..._args: any) => {},
        invoke: (..._args: any) => {},
    } as any);

    config.storage.set('abcd', StorageType.DOCUMENT, [
        {
            id: '123',
            title: 'Contexts',
            filepath: vaultPath + 'Elixir/Contexts.md',
            vaultId: 'abcd',
        },
        {
            id: '124',
            title: 'Schemas',
            filepath: vaultPath + 'Elixir/Schemas.md',
            vaultId: 'abcd',
        },
    ]);

    it('should parse tasks to inline tasks', async ({ expect }) => {
        const content = `- nejde\n- [x] ide nejde\n    - ide\n\n`;
        const result = await parse(
            {
                content,
                vaultId: 'abcd',
                filepath: '/vault/path/abcd.md',
            } as any,
            config,
        );
        expect(result.replace(/id="[^'"]+"/, 'id="abcd"')).toEqual(
            '<ul><li><p>nejde</p></li><li><div data-type="taskItemContent" id="abcd" completed="true">ide nejde</div><ul><li><p>ide</p></li></ul></li></ul><p></p>',
        );
    });

    it('should parse ordered lists', async ({ expect }) => {
        const content = `1. come to my day, explain this is place for your daily stuff, have tasks in agenda - 1. update image on web, 2. check on fix copy PR
2. click the task, get taken to the page with context.
    1. Jira issue clipped to page, name of the file to be edited written in the jira issue description.
    2. Realise you need the new image,
        1. open jira issue in external browser, tag Slavo with prompt for new image.
    3. Set status to in progress, so you know you are working on this and while waiting for Slavo, go work on other stuff.
`;
        const result = await parse(
            {
                content,
                vaultId: 'abcd',
                filepath: '/vault/path/abcd.md',
            } as any,
            config,
        );
        expect(result).toEqual(
            `
<ol>
<li>
<p>come to my day, explain this is place for your daily stuff, have tasks in agenda - 1. update image on web, 2. check on fix copy PR</p>
</li>
<li>
<p>click the task, get taken to the page with context.</p>
<ol>
<li>
<p>Jira issue clipped to page, name of the file to be edited written in the jira issue description.</p>
</li>
<li>
<p>Realise you need the new image,</p>
<ol>
<li>
<p>open jira issue in external browser, tag Slavo with prompt for new image.</p>
</li>
</ol>
</li>
<li>
<p>Set status to in progress, so you know you are working on this and while waiting for Slavo, go work on other stuff.</p>
</li>
</ol>
</li>
</ol>`.replaceAll('\n', ''),
        );
    });
});
