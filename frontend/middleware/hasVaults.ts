import { Context } from '@nuxt/types';

export default async function (ctx: Context) {
    await ctx.$serviceRegistry.waitForEssentialServices();

    const vaults = ctx.store.getters['vault/list'];

    if (vaults.length === 0) {
        return ctx.redirect(`/auth/login`);
    }
    return true;
}
