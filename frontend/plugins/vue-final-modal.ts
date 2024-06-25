import Vue from 'vue';
import VueFinalModal, { VueFinalModalProperty } from 'vue-final-modal';
import { Context, Plugin } from '@nuxt/types';

Vue.use(VueFinalModal);

declare module '@nuxt/types' {
    interface Context {
        $vfm: VueFinalModalProperty;
    }
}

const servicesPlugin: Plugin = (ctx: Context) => {
    ctx.$vfm = Vue.prototype.$vfm;
};

export default servicesPlugin;
