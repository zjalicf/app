import { Context } from '@nuxt/types';
import { parse, SemVer } from 'semver';
import { SafeElectronWindow } from '~/@types';

export class AutoUpdaterController {
    context: Context;
    currentVersion: SemVer;

    constructor(ctx: Context) {
        this.context = ctx;
        this.currentVersion = parse(this.context.$config.version) as SemVer;
    }

    _checkForUpdates(): any {
        if (this.context.$config.platform !== 'desktop') {
            console.warn('Cannot check for updates on non-desktop platforms');
            return;
        }
        return (window as SafeElectronWindow).electron.checkForUpdates();
    }

    async checkForUpdates() {
        if (this.context.$config.platform !== 'desktop') {
            console.warn('Cannot check for updates on non-desktop platforms');
            return;
        }

        try {
            this.context.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: 'Checking for updates',
                },
            });

            const update = await this._checkForUpdates();

            if (update.downloadPromise) {
                this.context.store.commit('autoUpdater/updateProgress', 1);
            }

            const updateNotFetched =
                !update.updateInfo || !update.updateInfo.version;
            const updateVersion = parse(update.updateInfo.version);

            if (updateNotFetched || updateVersion === null) {
                this.context.$notification.show({
                    component: () =>
                        import(
                            '@/components/notifications/MiscNotification.vue'
                        ),
                    bind: {
                        displayText:
                            'Update not available. You are on the latest version.',
                    },
                });
                return;
            }

            const updateAvailable =
                updateVersion.compare(this.currentVersion) === 1;

            if (!updateAvailable) {
                this.context.$notification.show({
                    component: () =>
                        import(
                            '@/components/notifications/MiscNotification.vue'
                        ),
                    bind: {
                        displayText:
                            'Update not available. You are on the latest version.',
                    },
                });
                return;
            }

            this.context.$notification.show({
                component: () =>
                    import(
                        '@/components/notifications/UpdateAvailableNotification.vue'
                    ),
            });
        } catch (error) {
            this.context.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: 'Error checking for updates. Try again later.',
                },
            });

            console.log(error);
        }
    }

    updateAndRestart() {
        if (this.context.$config.platform !== 'desktop') {
            console.warn('Cannot updateAndRestart on non-desktop platforms');
            return;
        }

        (window as SafeElectronWindow).electron.updateAndRestart();
    }

    openAppStore() {
        if (this.context.$config.platform !== 'mobile') {
            console.warn('Cannot openAppStore on non-mobile platforms');
            return;
        }

        const os = this.context.$config.os;

        try {
            if (os === 'ios') {
                window.open(
                    'itms-apps://apps.apple.com/us/app/id6443596904',
                    '_system',
                );
            }

            if (os === 'android') {
                window.open(
                    'https://play.google.com/store/apps/details?id=com.acreom.app',
                );
            }
        } catch (e) {
            console.warn('Unknown os when opening app store');
        }
    }
}
