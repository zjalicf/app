import { Context } from '@nuxt/types';

export class TooltipUtils {
    private context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    getRefText(reference: any) {
        return reference.getAttribute('data-tippy-content') ?? '';
    }

    createTooltip(content: string) {
        return `<div class='tooltip'>${content}</div>`;
    }
}
