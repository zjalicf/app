import { IntegrationConfig } from '~/workers/integrations/base';
import { LinearIntegrationConfig } from '~/@types/integrations';

const acreomPropToLinearFilter: Record<string, string> = {
    team: 'team',
    state: 'state',
    priority: 'priority',
    labels: 'labels',
    project: 'project',
    cycle: 'cycle',
    stateType: 'state',
    assignee: 'assignee',
};

const acreomPropToLinearProp: Record<string, string> = {
    team: 'id',
    state: 'id',
    priority: '',
    labels: 'id',
    project: 'id',
    cycle: 'id',
    stateType: 'type',
    assignee: 'id',
};

const nullFilter = (value: boolean = true) => {
    return {
        null: value,
    };
};

const inFilter = (property: string, values: string[]) => {
    const nonNullValues = values.filter(value => value !== null);
    const hasNull = values.length !== nonNullValues.length;
    if (hasNull && nonNullValues.length > 0) {
        return {
            or: [
                {
                    [property]: {
                        in: nonNullValues,
                    },
                },
                nullFilter(),
            ],
        };
    }
    if (hasNull) {
        return nullFilter();
    }
    if (!property) {
        return {
            in: values,
        };
    }
    return {
        [property]: {
            in: values,
        },
    };
};

const eqFilter = (property: string, value: string | null) => {
    if (!value) return nullFilter(true);
    if (!property) {
        return {
            eq: value,
        };
    }
    return {
        [property]: {
            eq: value,
        },
    };
};

const neqFilter = (property: string, value: string | null) => {
    if (!value) return nullFilter(false);
    if (!property) {
        return {
            neq: value,
        };
    }
    return {
        [property]: {
            neq: value,
        },
    };
};

const includesFilter = (property: string, values: string[]) => {
    return {
        and: values.map(value => eqFilter(property, value)),
    };
};

const ninFilter = (property: string, values: string[]) => {
    if (!property) {
        return {
            nin: values,
        };
    }
    return {
        [property]: {
            nin: values,
        },
    };
};

const createLinearValue = (value: string | string[]): string | string[] => {
    if (Array.isArray(value)) {
        const ids = value.map(id => id?.split('/').pop()! ?? null);
        const uniqueIds = new Set(ids);
        return [...uniqueIds.values()];
    }

    console.log(value);
    return value?.split('/').pop()! ?? null;
};

const convertPriorityValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
        return value.map(v => Number(v));
    }
    return Number(value);
};

const getFilterByOperation = (
    operation: string,
    property: string,
    value: string | string[],
) => {
    if (operation === 'eq') {
        return eqFilter(property, value as string);
    }
    if (operation === 'neq') {
        return neqFilter(property, value as string);
    }
    if (operation === 'in') {
        return inFilter(property, value as string[]);
    }
    if (operation === 'nin') {
        return ninFilter(property, value as string[]);
    }
    if (operation === 'includes') {
        return includesFilter(property, value as string[]);
    }

    return null;
};

const constructLinearFilter = (filter: any): any => {
    const property = filter.property;
    const operation = filter.operation;
    let value: string | string[] | any = createLinearValue(filter.value);
    if (property === 'priority') {
        value = convertPriorityValue(value);
    }
    const linearFilterProperty = acreomPropToLinearFilter[property];
    if (!linearFilterProperty) return null;
    const linearProperty = acreomPropToLinearProp[property];

    const linearFilter = getFilterByOperation(operation, linearProperty, value);
    if (!linearFilter) return null;
    return {
        property: linearFilterProperty,
        filter: linearFilter,
    };
};

const constructTeamFilter = (
    integration: IntegrationConfig<LinearIntegrationConfig>,
    view: any,
) => {
    if (view.teamId) {
        return eqFilter('id', createLinearValue(view.teamId) as string);
    }
    const teams = integration.data.teams ?? [];
    return inFilter('id', createLinearValue(teams) as string[]);
};

export const constructFiltersFromView = (
    integration: IntegrationConfig<LinearIntegrationConfig>,
    view: any,
) => {
    const filters: Record<string, any> = {};
    const teamFilter: Record<string, any> = {
        team: constructTeamFilter(integration, view),
    };

    for (const filter of view.filters) {
        if (!filter.value || !filter.value.length) continue;
        const linearFilter = constructLinearFilter(filter);
        if (!linearFilter) continue;

        filters[linearFilter.property] = linearFilter.filter;
    }

    return {
        ...filters,
        ...teamFilter,
    };
};
