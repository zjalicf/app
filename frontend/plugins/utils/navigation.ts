import { Context } from '@nuxt/types';
import { TabType } from '~/constants';
import { Tab, TabGroup } from '~/@types/app';
import { IDocument } from '~/components/document/model';
import { getDateInDailyDocFormat } from '~/helpers/date';
import { SafeElectronWindow } from '~/@types';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

export class NavigationUtils {
    private context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    get activeTabs(): Tab[] {
        return this.context.store.getters['tabs/groups'].map(
            (group: TabGroup) => {
                return this.context.store.getters['tabs/byId'](group.activeTab);
            },
        );
    }

    get activeTabId() {
        return this.context.store.getters['tabs/activeTabId'];
    }

    get activeTab(): Tab {
        return this.context.store.getters['tabs/byId'](this.activeTabId);
    }

    get activeGroupId(): string {
        return this.context.store.getters['tabs/activeTabGroupId'];
    }

    get activeDocuments(): IDocument[] {
        return this.activeTabs
            .map((tab: Tab) => {
                if (tab.type === TabType.MY_DAY) {
                    return this.context.store.getters['document/byDailyDoc'](
                        getDateInDailyDocFormat(tab.data.date),
                    );
                }

                if (tab.type !== TabType.DOCUMENT) return null;

                return this.context.store.getters['document/byId'](
                    tab.entityId,
                );
            })
            .filter((v: IDocument | null) => !!v);
    }

    get activeTabEntityId(): string {
        return this.activeTab?.entityId;
    }

    openSettings(tab: string = 'overview', source?: TrackingActionSource) {
        if (
            this.context.$vfm.openedModals.find(
                (modal: any) => modal.name === 'settings-modal',
            )
        )
            return;

        this.context.$vfm.show({
            component: () => import('~/components/modal/SettingsModal.vue'),
            bind: {
                openTab: tab,
            },
        });

        if (source) {
            this.context.$tracking.trackEventV2(TrackingType.SETTINGS, {
                action: TrackingAction.OPEN,
                source,
                // @ts-ignore
                sourceMeta: tab,
            });
        }
    }

    openExternalLink(url: string) {
        if (!url) return;

        if (this.context.$config.platform === 'desktop') {
            (window as SafeElectronWindow).electron.openExternal(url);
            return;
        }

        window.open(url, '_blank');
    }
}
