import CtrlIcon from '~/components/icons/CtrlIcon.vue';
import AltIcon from '~/components/icons/AltIcon.vue';
import CommandIcon from '~/components/icons/CommandIcon.vue';
import ShiftIcon from '~/components/icons/ShiftIcon.vue';
import ArrowDownIcon from '~/components/icons/ArrowDown.vue';
import ArrowUpIcon from '~/components/icons/ArrowUp.vue';
import ArrowLeftIcon from '~/components/icons/ArrowLeft.vue';
import ArrowRightIcon from '~/components/icons/ArrowRight.vue';
import BackspaceIcon from '~/components/icons/Backspace.vue';

const propsData = {
    size: 14,
};

export const iconComponents: any = {
    ctrl: {
        html: new CtrlIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
    alt: {
        html: new AltIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
    cmd: {
        html: new CommandIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
    shift: {
        html: new ShiftIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
    arrowdown: {
        html: new ArrowDownIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
    arrowup: {
        html: new ArrowUpIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
    arrowleft: {
        html: new ArrowLeftIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
    arrowright: {
        html: new ArrowRightIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
    backspace: {
        html: new BackspaceIcon({
            propsData,
        }).$mount().$el.outerHTML,
    },
};
