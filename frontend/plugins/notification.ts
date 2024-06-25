import Vue from 'vue';
import { Context, Plugin } from '@nuxt/types';
import Notification from '@/helpers/notification/index';

Vue.use(Notification);

const servicesPlugin: Plugin = (ctx: Context) => {
    ctx.$notification = Vue.prototype.$notification;
};

export default servicesPlugin;
