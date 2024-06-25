import Vue from 'vue';
import { v4 } from 'uuid';
import NotificationContainer from './NotificationContainer.vue';

function defineApi() {
    return Vue.observable({
        show(options: any) {
            this.notifications = [
                ...this.notifications,
                { ...options, id: v4() },
            ];
        },
        notifications: [] as any,
    });
}

function bindApi(component: any, api: any) {
    const _component = { ...component, props: { ...component.props } };
    Object.assign(_component.props, {
        api: { type: Object, default: () => api },
    });
    return _component;
}

function defineContainer(api: any) {
    return bindApi(NotificationContainer, api);
}

const install = (Vue: any) => {
    const api = defineApi();
    Vue.prototype.$notification = api;
    Vue.component('NotificationContainer', defineContainer(api));
};

export const notificationPlugin = () => ({
    install(Vue: any) {
        install(Vue);
    },
});

notificationPlugin.install = install;
