import Vue from 'vue';
import { Context, Plugin } from '@nuxt/types';
import ContextMenu from '@/helpers/context-menu/index';

Vue.use(ContextMenu);

const servicesPlugin: Plugin = (ctx: Context) => {
    ctx.$contextMenu = Vue.prototype.$contextMenu;
};

export default servicesPlugin;
