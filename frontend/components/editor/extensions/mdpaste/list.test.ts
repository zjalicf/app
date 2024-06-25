import { describe, it, expect } from 'vitest';
import {
    createNodeJSON,
    findCurrentLevelListItem,
} from '~/components/editor/extensions/mdpaste/list';

describe('md list paste handler', () => {
    const list = {
        type: 'bulletList',
        spacing: 0,
        content: [
            {
                type: 'listItem',
                spacing: 0,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'asdadsad',
                            },
                        ],
                    },
                    {
                        type: 'orderedList',
                        spacing: 4,
                        content: [
                            {
                                type: 'listItem',
                                spacing: 4,
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'aaaaa',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                spacing: 4,
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'bbbbb',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'bulletList',
                                        spacing: 8,
                                        content: [
                                            {
                                                type: 'listItem',
                                                spacing: 8,
                                                content: [
                                                    {
                                                        type: 'paragraph',
                                                        content: [
                                                            {
                                                                type: 'text',
                                                                text: 'asdasd',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'bulletList',
                                                        spacing: 12,
                                                        content: [
                                                            {
                                                                type: 'listItem',
                                                                spacing: 12,
                                                                content: [
                                                                    {
                                                                        type: 'paragraph',
                                                                        content:
                                                                            [
                                                                                {
                                                                                    type: 'text',
                                                                                    text: 'asdasd',
                                                                                },
                                                                            ],
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                spacing: 4,
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'ccccc',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    it('should find node at level 8', () => {
        const node = findCurrentLevelListItem(list, 8);
        expect(node).not.toEqual(false);
        expect(node.spacing).toEqual(8);
        expect(node.type).toEqual('bulletList');
    });
    it('should find node at level 12', () => {
        const node = findCurrentLevelListItem(list, 12);
        expect(node).not.toEqual(false);
        expect(node.spacing).toEqual(12);
        expect(node.type).toEqual('bulletList');
    });
    it('should find node at level 0', () => {
        const node = findCurrentLevelListItem(list, 0);
        expect(node).not.toEqual(false);
        expect(node.spacing).toEqual(0);
        expect(node.type).toEqual('bulletList');
    });

    it('should find correct node to insert to', () => {
        const nodeJSON = createNodeJSON(
            [
                '- asdadsad\n',
                '    1. aaaaa\n',
                '    2. bbbbb\n',
                '        - asdasd\n',
                '            - asdasd\n',
                '    - ccccc\n',
            ],
            { type: 'bulletList' },
        );

        expect(nodeJSON).toEqual(list);
    });
});
