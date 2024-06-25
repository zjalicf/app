import { describe, it } from 'vitest';
import { generateJSON } from '@tiptap/html';
import { ParserNodesList } from '~/components/editor/extensions/parser-node-list';
import { createReverseIndex } from '~/helpers/util';
import { createInlineParser } from '~/workers/utils/parsers/json-to-md/inline';
import { createBlockParser } from '~/workers/utils/parsers/json-to-md/block';
import { createMarksParser } from '~/workers/utils/parsers/json-to-md/marks';
import * as helpers from '~/workers/utils/parsers/helpers';
import { EntityStorage, StorageType } from '~/workers/utils/parsers/storage';
import { createMDParser } from '~/workers/utils/parsers/index';

const MDContent = `#elixir


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
    - [[Contexts]], basically Elixir modules that host business logic. Stuff that interacts with the database.
    - [[Schemas]], they map data from the database into Elixir structs.


![image.png](https://api-1.acreom.com/api/v1/e14ad041-7a7d-4aa7-9a37-bb1099c60b15/images/bb732e0b-827f-4d96-ba14-8e1de9639934)
`;

const HTMLContent = String.raw`<p>#elixir</p><p></p><p></p><h1 data-id="123">Getting started</h1><p></p><pre><code class="hljs language-shell">cd phx-project</code></pre><p></p><p></p><p>Then configure your database in config/dev.exs and run:</p><pre><code class="hljs language-shell">mix ecto.create</code></pre><p></p><p></p><p>Start your Phoenix app with:</p><pre><code class="hljs language-shell">mix phx.server</code></pre><p></p><p></p><p>You can also run your app inside IEx (Interactive Elixir) as:</p><pre><code class="hljs language-shell">iex -S mix phx.server</code></pre><p></p><p></p><h1 data-id="123">Phoenix Request Lifecycle</h1><p></p><ul><li><p>The endpoint is where the request land after being converted to <code>conn</code> by the server</p></li><li><p><code>conn</code> gets forwarded to the router</p><ul><li><p>This moves it through its pipeline</p></li></ul></li></ul><ul><li><p>Pipeline passes it to its controler</p></li><li><p>Controller launches a view that uses <code>conn</code> data to render the page for the user</p></li></ul><p>Phoenix is itself a pipeline for transforming a <code>conn</code>.</p><p></p><pre><code class="hljs language-elixir">conn
|> endpoint    # plug
|> router      # plug
|> controller  # plug
|> view</code></pre><p></p><p></p><ul><li><p>Business logic resides in <code>lib/appname</code></p><ul><li><p>This is called a <em>model</em> in MVC frameworks</p></li><li><p><inline-document-link id='123'></inline-document-link>, basically Elixir modules that host business logic. Stuff that interacts with the database.</p></li><li><p><inline-document-link id='124'></inline-document-link>, they map data from the database into Elixir structs.</p></li></ul></li></ul><p></p><img src='https://api-1.acreom.com/api/v1/e14ad041-7a7d-4aa7-9a37-bb1099c60b15/images/bb732e0b-827f-4d96-ba14-8e1de9639934' alt='image.png'><p></p>`;

describe('parser consistency', () => {
    const parse = createMDParser({
        $config: {
            os: 'linux',
        },
        emit: (..._args: any) => {},
        invoke: (..._args: any) => {},
    } as any);
    const vaultPath = '/vault/path/';
    const MDToHTMLConfig = {
        endline: '\n',
        sep: '/',
        entityPath: '/vault/path/abcd.md',
        entity: {
            vaultId: 'vault-id',
            metadata: {
                id: '123e',
            },
        },
        images: {
            remoteUrlIndex: [],
            filepathIndex: [],
        },
        media: [],
        documents: createReverseIndex(
            [
                {
                    id: '123',
                    title: 'Contexts',
                    filepath: vaultPath + 'Elixir/Contexts.md',
                },
                {
                    id: '124',
                    title: 'Schemas',
                    filepath: vaultPath + 'Elixir/Schemas.md',
                },
            ],
            'filepath',
        ),
        events: [],
        tasks: { filepathIndex: [] },
        storage: new EntityStorage({ os: 'linux' } as any),
    };

    const JSONToMDConfig = {
        vault: {
            id: 'vault-id',
            name: 'vault-name',
            filepath: vaultPath,
        },
        sep: '/',
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
        storage: new EntityStorage({ os: 'linux' } as any),
        helpers,
        depth: -1,
    };

    JSONToMDConfig.storage.set(JSONToMDConfig.vault.id, StorageType.DOCUMENT, [
        {
            id: 123,
            title: 'Contexts',
            filepath: vaultPath + 'Elixir/Contexts.md',
            vaultId: JSONToMDConfig.vault.id,
            type: 'document',
        },
        {
            id: 124,
            title: 'Schemas',
            filepath: vaultPath + 'Elixir/Schemas.md',
            vaultId: JSONToMDConfig.vault.id,
            type: 'document',
        },
    ]);

    MDToHTMLConfig.storage.set(JSONToMDConfig.vault.id, StorageType.DOCUMENT, [
        {
            id: '123',
            title: 'Contexts',
            filepath: vaultPath + 'Elixir/Contexts.md',
            vaultId: JSONToMDConfig.vault.id,
            type: 'document',
        },
        {
            id: '124',
            title: 'Schemas',
            filepath: vaultPath + 'Elixir/Schemas.md',
            vaultId: JSONToMDConfig.vault.id,
            type: 'document',
        },
    ]);

    MDToHTMLConfig.storage.set(
        JSONToMDConfig.vault.id,
        StorageType.VAULT,
        JSONToMDConfig.vault,
    );

    JSONToMDConfig.storage.set(
        JSONToMDConfig.vault.id,
        StorageType.VAULT,
        JSONToMDConfig.vault,
    );

    it('should parse the same content HTML to MD', async ({ expect }) => {
        const JSONContent = generateJSON(HTMLContent || '', ParserNodesList);

        const parsed = await JSONToMDConfig.block.parse(
            JSONContent.content,
            JSONToMDConfig,
        );

        let result = await parse(
            {
                content: parsed,
                vaultId: JSONToMDConfig.vault.id,
                filepath: '/vault/path/abcd.md',
            } as any,
            MDToHTMLConfig,
        );
        result = result.replaceAll(/data-id="[^"]+?"/g, 'data-id="123"');
        expect(result).toEqual(HTMLContent);
    });

    it('should parse the same content MD to HTML', async ({ expect }) => {
        let result = await parse(
            {
                content: MDContent,
                vaultId: JSONToMDConfig.vault.id,
                filepath: '/vault/path/abcd.md',
            } as any,
            MDToHTMLConfig,
        );
        result = result.replaceAll(/data-id="[^"]+?"/g, 'data-id="123"');

        const JSONContent = generateJSON(result || '', ParserNodesList);

        const parsed = await JSONToMDConfig.block.parse(
            JSONContent.content,
            JSONToMDConfig,
        );
        expect(parsed).toEqual(MDContent);
    });
});
