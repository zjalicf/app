import { describe, it } from 'vitest';
import { createMDParser, EntityStorage } from '~/workers/utils/parsers';
import { StorageType } from '~/workers/utils/parsers/storage';
import { bigContent, slowDoc } from '~/workers/utils/parsers/data.setup';

const content = `#elixir


# Getting started

\`\`\`shell
cd phx-project
\`\`\`


Then configure your database in config/dev.exs and run:
\`\`\`shell
mix ecto.create
\`\`\`


Start your Phoenix app with:
\`\`\`shell
mix phx.server
\`\`\`


You can also run your app inside IEx (Interactive Elixir) as:
\`\`\`shell
iex -S mix phx.server
\`\`\`


# Phoenix Request Lifecycle

- The endpoint is where the request land after being converted to \`conn\` by the server
- \`conn\` gets forwarded to the router
    - This moves it through its pipeline

- Pipeline passes it to its controler
- Controller launches a view that uses \`conn\` data to render the page for the user

Phoenix is itself a pipeline for transforming a \`conn\`.

\`\`\`elixir
conn
|> endpoint    # plug
|> router      # plug
|> controller  # plug
|> view
\`\`\`


- Business logic resides in \`lib/appname\`
    - This is called a *model* in MVC frameworks
    - [[/Elixir/Contexts]], basically Elixir modules that host business logic. Stuff that interacts with the database.
    - [[Elixir/Schemas]], they map data from the database into Elixir structs.


![image.png](https://api-1.acreom.com/api/v1/e14ad041-7a7d-4aa7-9a37-bb1099c60b15/images/bb732e0b-827f-4d96-ba14-8e1de9639934)
`;

const parsedContent = String.raw`<p>#elixir</p><p></p><p></p><h1 data-id="123">Getting started</h1><p></p><pre><code class="hljs language-shell">cd phx-project</code></pre><p></p><p></p><p>Then configure your database in config/dev.exs and run:</p><pre><code class="hljs language-shell">mix ecto.create</code></pre><p></p><p></p><p>Start your Phoenix app with:</p><pre><code class="hljs language-shell">mix phx.server</code></pre><p></p><p></p><p>You can also run your app inside IEx (Interactive Elixir) as:</p><pre><code class="hljs language-shell">iex -S mix phx.server</code></pre><p></p><p></p><h1 data-id="123">Phoenix Request Lifecycle</h1><p></p><ul><li><p>The endpoint is where the request land after being converted to <code>conn</code> by the server</p></li><li><p><code>conn</code> gets forwarded to the router</p><ul><li><p>This moves it through its pipeline</p></li></ul></li></ul><ul><li><p>Pipeline passes it to its controler</p></li><li><p>Controller launches a view that uses <code>conn</code> data to render the page for the user</p></li></ul><p>Phoenix is itself a pipeline for transforming a <code>conn</code>.</p><p></p><pre><code class="hljs language-elixir">conn
|> endpoint    # plug
|> router      # plug
|> controller  # plug
|> view</code></pre><p></p><p></p><ul><li><p>Business logic resides in <code>lib/appname</code></p><ul><li><p>This is called a <em>model</em> in MVC frameworks</p></li><li><p><inline-document-link id='123'></inline-document-link>, basically Elixir modules that host business logic. Stuff that interacts with the database.</p></li><li><p><inline-document-link id='124'></inline-document-link>, they map data from the database into Elixir structs.</p></li></ul></li></ul><p></p><img src='https://api-1.acreom.com/api/v1/e14ad041-7a7d-4aa7-9a37-bb1099c60b15/images/bb732e0b-827f-4d96-ba14-8e1de9639934' alt='image.png'><p></p>`;

describe('md-to-html/parser', () => {
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

    it('should parse markdown to html', async ({ expect }) => {
        let result = await parse(
            {
                content,
                vaultId: 'abcd',
                filepath: '/vault/path/abcd.md',
            } as any,
            config,
        );
        result = result.replaceAll(/data-id="[^"]+?"/g, 'data-id="123"');
        expect(result).toEqual(parsedContent);
    });

    it('should parse wikilink with oc and preview', async ({ expect }) => {
        const result = await parse(
            {
                content: 'das\n![[Elixir/Schemas#kek]]',
                vaultId: 'abcd',
                filepath: '/vault/path/abcd.md',
            } as any,
            config,
        );
        expect(result).toEqual(
            `<p>das</p><p><inline-document-link id='124' preview=true oc='#kek'></inline-document-link></p>`,
        );
    });

    it('should parse links', async ({ expect }) => {
        const expectedResult = `<p><a href="https://google.com">Link</a></p>
<p></p>
<p><a href="https://google.com">Link</a> text <a href="https://google.com">Link</a></p>
<p></p>
<p>Text <a href="https://google.com">Link</a> Text <a href="https://google.com">Link</a></p>
<p></p>
<p><a href="https://google.com">Link</a> Text</p>
<p></p>
<p>Text <a href="https://google.com">Link</a> Text</p>
<p></p>
<p><a href="https://google.com">Link</a> text <a href="https://google.com">Link</a></p>
<p></p>
<p>Text <a href="https://google.com">Link</a></p>`.replace(/\n/g, '');

        const data = `[Link](https://google.com)

[Link](https://google.com) text [Link](https://google.com)

Text [Link](https://google.com) Text [Link](https://google.com)

[Link](https://google.com) Text

Text [Link](https://google.com) Text

[Link](https://google.com) text [Link](https://google.com)

Text [Link](https://google.com)`;

        const result = await parse(
            {
                content: data,
                vaultId: 'abcd',
                filepath: '/vault/path/abcd.md',
            } as any,
            config,
        );
        expect(result).toEqual(expectedResult);
    });

    it('should parse details', async ({ expect }) => {
        const data = `> [!info] Context
> A subforum on [[Reddit]] aimed at sharing science-based resources and advice for parents. `;
        const result = await parse(
            {
                content: data,
                vaultId: 'abcd',
                filepath: '/vault/path/abcd.md',
            } as any,
            config,
        );
        expect(result).not.empty;
    });

    //     it('should parse complex content with details', async ({ expect }) => {
    //         const data = `# The Inbox
    // This isn't a normal inbox. It's a cooling pad 🧊.
    //
    // Thoughts come in hot 🌶. But after a few days, they cool down ❄️.
    //
    // When cooler thoughts prevail, you can better prioritize. Cool?
    //
    // This view looks at the 20 newest notes in your **+ Encounters** folder. As you process each note, make connections, add details, move them to the best folder,  and delete everything that no longer sparks ✨.
    //
    // > [!HINT]+ This data view 🔬 only renders in the free downloadable version.
    // > If you are viewing this note on Obsidian Publish, you won't be able to see the magic unless you [download the kit](https://www.linkingyourthinking.com/download-lyt-kit), but here's what it looks like in my personal vault...
    // > ![[lyt-kit-example-cooling-pad-.jpg]]
    // > If you can see the table below, you have already downloaded the LYT Kit.
    //
    // \`\`\` dataview
    // TABLE WITHOUT ID
    //  file.link as "Encounters and new notes",
    //  (date(today) - file.cday).day as "Days alive"
    //
    // FROM "+ Encounters" and -#on/readme
    //
    // SORT file.cday asc
    //
    // LIMIT 20
    // \`\`\`
    // `;
    //         const result = await parse(
    //             { content: data, vaultId: 'abcd' } as any,
    //             config,
    //         );
    //         expect(result).toContain('<summary type="HINT" open="true"');
    //     });

    it('should parse big content', async ({ expect }) => {
        const result = await parse(
            { content: bigContent, vaultId: 'abcd' } as any,
            config,
        );
        expect(result).not.empty;
    });

    it('should parse slow content', async ({ expect }) => {
        const result = await parse(
            { content: slowDoc, vaultId: 'abcd' } as any,
            config,
        );
        expect(result).not.empty;
    });

    it('should parse empyt task', async ({ expect }) => {
        const result = await parse(
            { content: `- [ ] \n\n`, vaultId: 'abcd' } as any,
            config,
        );
        const parsedResult = result.replace(/id=".*?"/, 'id="abcdef"');
        expect(parsedResult).toEqual(
            `<ul><li><div data-type="taskItemContent" id="abcdef" completed="false"></div></li></ul><p></p>`,
        );
    });

    it('should parse nested wikilink', async ({ expect }) => {
        config.storage.set('abcd', StorageType.DOCUMENT, [
            {
                id: '126',
                title: 'ide nejde',
                filepath: vaultPath + 'ide nejde.md',
            },
            {
                id: '127',
                text: '[] [[ide nejdem]] asdas',
                filepath:
                    vaultPath +
                    ['keko', '[] [[ide nejdem]] asdas.md'].join(config.sep),
            },
        ]);
        const result = await parse(
            {
                content: '[[ide nejde]] asdas [[keko/[] [[ide nejdem]] asdas]]',
                vaultId: 'abcd',
                filepath: '/vault/path/abcd.md',
            } as any,
            config,
        );

        expect(result).toEqual(
            '<p><inline-document-link id="126"></inline-document-link> asdas <inline-document-link id="127"></inline-document-link></p>'.replaceAll(
                '"',
                "'",
            ),
        );
    });

    it('should parse kbd', async ({ expect }) => {
        const result = await parse(
            {
                content: 'das <kbd>Ctrl</kbd>',
                vaultId: 'abcd',
                filepath: '/vault/path/abcd.md',
            } as any,
            config,
        );

        expect(result).toEqual('<p>das <kbd>Ctrl</kbd></p>');
    });
});
