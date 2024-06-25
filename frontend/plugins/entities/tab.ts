import { EntityController } from '~/plugins/entities/controller';

export class TabController extends EntityController<any> {
    protected storeEntity: string = 'tabs';

    getById(id: string): any {
        return this.context.store.getters['tabs/byId'](id) || null;
    }

    getData(id: string) {
        const tab = this.getById(id);
        if (!tab) return null;
        return tab.data;
    }
}
