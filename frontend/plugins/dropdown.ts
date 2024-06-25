import Vue from 'vue';
import { Context, Plugin } from '@nuxt/types';
import Dropdown from '@/helpers/dropdown/index';

Vue.use(Dropdown);

const servicesPlugin: Plugin = (ctx: Context) => {
    ctx.$dropdown = Vue.prototype.$dropdown;
};

export default servicesPlugin;
