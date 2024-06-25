import { PasteRule } from '@tiptap/core';
import { headingPasteRule } from '~/components/editor/extensions/mdpaste/heading';
import { EditorContext } from '~/@types/app';
import { listPasteRule } from '~/components/editor/extensions/mdpaste/list';
import { codeblockPasteRule } from '~/components/editor/extensions/mdpaste/codeblock';
import { horizontalRulePasteRule } from '~/components/editor/extensions/mdpaste/hr';
import { taskBlockPaste } from '~/components/editor/extensions/mdpaste/task';
import { blockquotePasteRule } from '~/components/editor/extensions/mdpaste/blockquote';

export const blockPasteRules = (ctx: EditorContext): any[] => [
    headingPasteRule(ctx),
    horizontalRulePasteRule(ctx),
    listPasteRule(ctx),
    taskBlockPaste(ctx),
    codeblockPasteRule(ctx),
    blockquotePasteRule(ctx),
];
