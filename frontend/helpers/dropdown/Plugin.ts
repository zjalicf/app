import Vue from 'vue';
import DropdownContainer from './DropdownContainer.vue';

function defineApi() {
    return Vue.observable({
        show(options: any) {
            this.dropdownList = [
                ...this.dropdownList,
                {
                    backdrop: true,
                    retainFocus: false,
                    animate: true,
                    preventBackdrop: false,
                    ...options,
                },
            ];
        },
        hideAll() {
            this.dropdownList.forEach((options: any) => {
                if (options && options.onClose) {
                    options.onClose();
                }
            });
            this.dropdownList = [];
            this.poppers = [];
        },
        hide(name: string) {
            const index = this.dropdownList.findIndex(
                (options: any) => options.name === name,
            );
            if (index === -1) {
                return;
            }

            this.poppers.forEach((popper: any, idx) => {
                if (idx === index && popper) {
                    popper.destroy();
                }
            });

            this.poppers = this.poppers.filter((_: any, idx) => {
                return idx === index;
            });

            this.dropdownList = this.dropdownList.filter((options: any) => {
                if (options.name === name) {
                    if (options.onClose) {
                        options.onClose();
                    }

                    return false;
                }

                return true;
            });
        },
        poppers: [],
        dropdownList: [] as any[],
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
    return bindApi(DropdownContainer, api);
}

const installPlugin = (Vue: any) => {
    const api = defineApi();
    Vue.prototype.$dropdown = api;
    Vue.component('DropdownContainer', defineContainer(api));
};

export const dropdownPlugin = () => ({
    install(Vue: any) {
        installPlugin(Vue);
    },
});

dropdownPlugin.install = installPlugin;
