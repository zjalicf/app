import Vue from 'vue';
import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { copy } from './copy-to-clipboard';
import { NavigationUtils } from '~/plugins/utils/navigation';
import { FileSystemUtils } from '~/plugins/utils/file-system';
import { PageUtils } from '~/plugins/utils/page';
import { throttle } from '~/helpers';
import { AssistantUtils } from '~/plugins/utils/assistant';
import { MobileUtils } from '~/plugins/utils/mobile';
import { CalendarUtils } from '~/plugins/utils/calendar';
import { TooltipUtils } from '~/plugins/utils/tooltip';
import { EventUtils } from '~/plugins/utils/event';
import { OnboardingUtils } from '~/plugins/utils/onboarding';
import { SidebarUtils } from '~/plugins/utils/sidebar';
import { PageListUtils } from '~/plugins/utils/page-list';
import { IntegrationsUtils } from '~/plugins/utils/integrations';

const PRESS_TIMEOUT = 500;

class HapticsEngine {
    async heavy() {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        Haptics.impact({ style: ImpactStyle.Heavy });
    }

    async medium() {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        Haptics.impact({ style: ImpactStyle.Medium });
    }

    async light() {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        Haptics.impact({ style: ImpactStyle.Light });
    }
}

const throttledByFps = throttle(requestAnimationFrame);

const hapticsEngine = new HapticsEngine();

const windowFunctions: any = [];

window.addEventListener(
    'scroll',
    () => {
        throttledByFps(() => {
            for (const fn of windowFunctions) {
                fn();
            }
        });
    },
    true,
);

Vue.directive('longpress', {
    bind: (el: any, { value, modifiers }: any, vNode: any) => {
        if (typeof value !== 'function') {
            console.warn(`Expect a function, got ${value}`);
            return;
        }

        let pressTimer: any = null;

        const start = (e: any) => {
            if (e.type === 'mousedown' && e.button !== 0) {
                return;
            }

            if (pressTimer === null) {
                if (vNode.elm) {
                    vNode.elm.classList.add('active');
                }
                if (modifiers.hapticstart) {
                    hapticsEngine.light();
                }
                pressTimer = setTimeout(() => {
                    if (modifiers.hapticend) {
                        hapticsEngine.medium();
                    }
                    return value(e);
                }, PRESS_TIMEOUT);
            }
        };

        const cancel = () => {
            if (vNode.elm) {
                vNode.elm.classList.remove('active');
            }
            if (pressTimer !== null) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        };

        windowFunctions.push(cancel);

        ['mousedown', 'touchstart'].forEach(e => el.addEventListener(e, start));
        ['click', 'mouseout', 'touchend', 'touchcancel'].forEach(e =>
            el.addEventListener(e, cancel),
        );
    },
});

declare module '@nuxt/types' {
    interface Context {
        $utils: {
            fileSystem: FileSystemUtils;
            navigation: NavigationUtils;
            page: PageUtils;
            isElectron(): boolean;
            isWindows: boolean;
            isLinux: boolean;
            isMac: boolean;
            isMobile: boolean;
            refreshCalendarData(): void;
            haptics: HapticsEngine;
            assistant: AssistantUtils;
            mobile: MobileUtils;
            tooltip: TooltipUtils;
            copyToClipboard: (
                text: string,
                message?: string,
                options?: {
                    debug?: boolean;
                    message?: string;
                    format?: string; // MIME type
                    onCopy?: (clipboardData: object) => void;
                },
            ) => boolean;
            calendar: CalendarUtils;
            event: EventUtils;
            onboarding: OnboardingUtils;
            sidebar: SidebarUtils;
            pageList: PageListUtils;
            showMiscNotification: (message: string, bind?: any) => void;
            integrations: IntegrationsUtils;
        };
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $utils: {
            fileSystem: FileSystemUtils;
            navigation: NavigationUtils;
            page: PageUtils;
            isElectron(): boolean;
            isWindows: boolean;
            isLinux: boolean;
            isMac: boolean;
            isMobile: boolean;
            refreshCalendarData(): void;
            haptics: HapticsEngine;
            assistant: AssistantUtils;
            mobile: MobileUtils;
            calendar: CalendarUtils;
            tooltip: TooltipUtils;
            copyToClipboard: (
                text: string,
                message?: string,
                options?: {
                    debug?: boolean;
                    message?: string;
                    format?: string; // MIME type
                    onCopy?: (clipboardData: object) => void;
                },
            ) => boolean;
            event: EventUtils;
            onboarding: OnboardingUtils;
            sidebar: SidebarUtils;
            pageList: PageListUtils;
            showMiscNotification: (message: string, bind?: any) => void;
            integrations: IntegrationsUtils;
        };
    }
}

export default ($ctx: Context, inject: Inject) => {
    const isElectron = () => {
        try {
            // eslint-disable-next-line no-prototype-builtins
            return window.hasOwnProperty('electron');
        } catch (err) {
            return false;
        }
    };

    let nuxtReady = false;
    let refreshCalled = false;
    const nuxtPromise = new Promise<void>(resolve => {
        (window as any).onNuxtReady(() => {
            nuxtReady = true;
            resolve();
        });
    });

    const refreshCalendarData = async () => {
        if (refreshCalled) return;
        refreshCalled = true;
        if (!nuxtReady) {
            await nuxtPromise;
        }
        window?.$nuxt.$emit('refreshLocalEvents');
        refreshCalled = false;
    };

    const showMiscNotification = (message: string, bind: any = {}) => {
        $ctx.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                ...bind,
                displayText: message,
            },
        });
    };

    const utils = {
        fileSystem: new FileSystemUtils($ctx),
        navigation: new NavigationUtils($ctx),
        page: new PageUtils($ctx),
        isElectron,
        isWindows: $ctx.$config.os === 'windows',
        isLinux: $ctx.$config.os === 'linux',
        isMac: $ctx.$config.os === 'mac',
        isMobile: $ctx.$config.platform === 'mobile',
        refreshCalendarData,
        haptics: hapticsEngine,
        mobile: new MobileUtils($ctx),
        tooltip: new TooltipUtils($ctx),
        assistant: new AssistantUtils($ctx),
        calendar: new CalendarUtils($ctx),
        copyToClipboard: (
            text: string,
            message: string = 'Copied to clipboard',
            options?: {
                debug?: boolean;
                message?: string;
                format?: string; // MIME type
                onCopy?: (clipboardData: object) => void;
            },
        ) => {
            return copy($ctx, text, message, options);
        },
        showMiscNotification,
        event: new EventUtils($ctx),
        onboarding: new OnboardingUtils($ctx),
        sidebar: new SidebarUtils($ctx),
        pageList: new PageListUtils($ctx),
        integrations: new IntegrationsUtils($ctx),
    };

    $ctx.$utils = utils;
    inject('utils', utils);
};
