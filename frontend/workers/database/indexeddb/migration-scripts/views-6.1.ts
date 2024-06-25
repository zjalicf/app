import { v4 } from 'uuid';
import { WorkerContext } from '~/@types/app';
import {
    IView,
    ViewCombineDefinition,
    ViewPropertyDefinition,
} from '~/components/view/model';

const updateDefinition = (definition: ViewCombineDefinition) => {
    const newDefinition: (ViewCombineDefinition | ViewPropertyDefinition)[] =
        definition.definition.map(item => {
            if ((item as ViewCombineDefinition).combine) {
                return updateDefinition(item as ViewCombineDefinition);
            }

            if ((item as ViewPropertyDefinition).property === 'template') {
                return {
                    property: 'template',
                    operation: 'neq',
                    value: true,
                } as ViewPropertyDefinition;
            }

            if ((item as ViewPropertyDefinition).property === 'dailyDoc') {
                return {
                    property: 'dailyDoc',
                    operation: 'isNotSet',
                    value: null,
                } as ViewPropertyDefinition;
            }

            if ((item as ViewPropertyDefinition).property === 'archived') {
                return {
                    property: 'archived',
                    operation: 'neq',
                    value: true,
                } as ViewPropertyDefinition;
            }

            return item as ViewPropertyDefinition;
        });

    return {
        ...definition,
        definition: newDefinition,
    } as ViewCombineDefinition;
};

export const migrateViews = async (vaultId: string, context: WorkerContext) => {
    const views: IView[] = await context.$deviceService.Views.list(vaultId);

    for (const view of views) {
        const definitions = view.definition;
        view.definition = definitions.map(definition => {
            if (definition.combine) {
                return updateDefinition(definition);
            }

            return definition;
        });
    }

    await context.$deviceService.Views.saveBulk(vaultId, views, {
        clientId: '*',
        writeToDevice: true,
    });
};
