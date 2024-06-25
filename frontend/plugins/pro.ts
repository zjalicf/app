import Vue from 'vue';

const hasAccessStyling = (el: HTMLElement, vnode: any) => {
    const proExpired =
        // @ts-ignore
        vnode.context?.$store.$accessControl.readOnlyAccess;
    if (proExpired) {
        el.style.opacity = '0.4';
    } else {
        el.style.opacity = '1';
    }
};

const hasAccessDisabled = (el: HTMLElement, vnode: any) => {
    const proExpired =
        // @ts-ignore
        vnode.context?.$store.$accessControl.readOnlyAccess;
    if (proExpired) {
        el.setAttribute('disabled', '');
        el.style.cursor = 'default';
    } else {
        el.removeAttribute('disabled');
        el.style.removeProperty('cursor');
    }
};

const hasAccessHide = (el: HTMLElement, vnode: any) => {
    const proExpired =
        // @ts-ignore
        vnode.context?.$store.$accessControl.readOnlyAccess;
    if (proExpired) {
        el.style.display = 'none';
    } else {
        el.style.removeProperty('display');
    }
};

const hasAccess = (event: any, binding: any, vnode: any) => {
    const proExpired =
        // @ts-ignore
        vnode.context?.$store.$accessControl.readOnlyAccess;
    if (binding.modifiers.stop) {
        event.stopImmediatePropagation();
    }
    if (binding.modifiers.prevent) {
        event.preventDefault();
    }
    if (!proExpired) {
        binding.value();
        return;
    }
    vnode.context?.$nuxt.$emit('readOnlyTest', true);
};

Vue.directive('pro', {
    bind(el, binding, vnode) {
        if (binding.modifiers.style) {
            hasAccessStyling(el, vnode);
        }
        if (binding.modifiers.disabled) {
            hasAccessDisabled(el, vnode);
        }
        if (binding.modifiers.hide) {
            hasAccessHide(el, vnode);
        }

        const event = binding.arg;
        el.addEventListener(event!, e => hasAccess(e, binding, vnode));
    },
    update(el, binding, vnode, _oldVnode) {
        if (binding.modifiers.style) {
            hasAccessStyling(el, vnode);
        }
        if (binding.modifiers.disabled) {
            hasAccessDisabled(el, vnode);
        }
        if (binding.modifiers.hide) {
            hasAccessHide(el, vnode);
        }
    },
    unbind(el, binding, vnode) {
        const event = binding.arg;
        el.removeEventListener(event!, e => hasAccess(e, binding, vnode));
    },
});
