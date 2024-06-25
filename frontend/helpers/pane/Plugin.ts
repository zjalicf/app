import Vue from 'vue';
import PaneContainer from './PaneContainer.vue';

function defineApi() {
    return Vue.observable({
        show(options: any) {
            this.components.push({
                ...options,
            });
        },
        async hide() {
            const pane = this.panes.pop();
            if (pane) {
                await pane.destroy({ animate: true });
            }

            this.externalClose = true;

            const component = this.components.pop();

            if (component && component.onClose) {
                component.onClose();
            }
        },
        async hideAll() {
            for (const pane of this.panes) {
                await pane.destroy({ animate: true });
            }

            for (const component of this.components) {
                if (component.onClose) {
                    component.onClose();
                }
            }
            this.panes = [];
            this.components = [];
        },
        calcFitHeight() {
            for (const pane of this.panes) {
                pane.calcFitHeight();
            }
        },
        externalClose: false,
        pane: null,
        components: [],
        panes: [],
    } as any);
}

function bindApi(component: any, api: any) {
    const _component = { ...component, props: { ...component.props } };
    Object.assign(_component.props, {
        api: { type: Object, default: () => api },
    });
    return _component;
}

function defineContainer(api: any) {
    return bindApi(PaneContainer, api);
}

const installVfm = (Vue: any) => {
    const api = defineApi();
    Vue.prototype.$pane = api;
    Vue.component('PaneContainer', defineContainer(api));
};

export const panePlugin = () => ({
    install(Vue: any) {
        installVfm(Vue);
    },
});

panePlugin.install = installVfm;
