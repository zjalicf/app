import Vue from 'vue';
import ContextMenuContainer from './ContextMenuContainer.vue';

function defineApi() {
    return Vue.observable({
        show(e: MouseEvent, options: any) {
            return new Promise(resolve => {
                this.contextMenu = null;

                this.contextMenu = { event: e, ...options, resolve };
            });
        },
        hide() {
            this.contextMenu = null;
        },
        contextMenu: null,
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
    return bindApi(ContextMenuContainer, api);
}

const installVfm = (Vue: any) => {
    const api = defineApi();
    Vue.prototype.$contextMenu = api;
    Vue.component('ContextMenuContainer', defineContainer(api));
};

export const contextMenuPlugin = () => ({
    install(Vue: any) {
        installVfm(Vue);
    },
});

contextMenuPlugin.install = installVfm;
