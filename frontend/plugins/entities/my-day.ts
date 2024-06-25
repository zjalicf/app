import { EntityController } from '~/plugins/entities/controller';
import { TabType } from '~/constants';
export class MyDayController extends EntityController<any> {
    open(
        options?: {
            event?: MouseEvent | null | undefined;
            data?: any;
        },
        tabOpenOptions?: {
            openInNewTab?: boolean;
            shouldActivate?: boolean;
        },
    ) {
        let tabData = {};
        if (options?.data) {
            tabData = options.data;
        }
        const tab = this.context.$tabs.createNewTabObject(
            TabType.MY_DAY,
            TabType.MY_DAY,
            tabData,
        );
        if (options?.event)
            return this.context.$tabs.openTabWithEvent(tab, options.event);
        return this.context.$tabs.openTab(tab, null, tabOpenOptions);
    }
}
