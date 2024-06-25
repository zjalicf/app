import { Context } from '@nuxt/types';

export class NuxtAdapter {
    context!: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    execute(operation: string, payload: any) {
        if (operation === 'emit') {
            if (!window.$nuxt || !window.$nuxt.$emit) {
                window.onNuxtReady(() => {
                    window.$nuxt.$emit(payload.event, payload.data);
                });
                return;
            }

            window.$nuxt.$emit(payload.event, payload.data);
        }
        if (operation === 'redirect') {
            if (!window.$nuxt || !window.$nuxt.$router) {
                window.onNuxtReady(() => {
                    window.$nuxt.$router.push(payload.route);
                });
                return;
            }
            window.$nuxt.$router.push(payload.route);
        }
    }
}
