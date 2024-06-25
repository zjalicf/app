import { add, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { extractDate } from '~/helpers';
import { GithubIntegrationDataType } from '~/components/github/github';
import { JiraIntegrationDataType } from '~/constants/jira';
import { SearchIndex } from '~/constants';

export const propertiesFilter = (
    entities: any[],
    propertiesMatch: any,
    userData: any,
) => {
    const preparedProperties = preparePropertiesFilters(propertiesMatch);
    let outputEntities = entities;
    for (const prop of preparedProperties) {
        outputEntities = outputEntities.filter(entity => {
            const isScheduleFilter = ['start_date', 'end_date'].includes(
                prop.key,
            );
            const isMetaDateFilter = ['created_at', 'updated_at'].includes(
                prop.key,
            );
            if (isScheduleFilter) {
                return handleScheduledFilter(prop, entity);
            }
            if (isMetaDateFilter) {
                return handleMetaDateFilter(prop, entity);
            }
            return handlePropertyFilter(prop, entity, userData);
        });
    }
    return outputEntities;
};

export const shouldPrepareUsers = (propertiesMatch: any) => {
    if (Array.isArray(propertiesMatch)) {
        return (
            propertiesMatch.filter(
                prop =>
                    ['creator', 'assignee'].includes(prop.key) &&
                    prop.value === 'you',
            ).length > 0
        );
    }
    const userQuery = Object.entries(propertiesMatch).filter(
        ([key, value]: [key: string, value: any]) =>
            ['creator', 'assignee'].includes(key) && value.value === 'you',
    );
    return !!userQuery.length;
};

export const preparePropertiesFilters = (propertiesMatch: any) => {
    const propertiesFilterArray = Object.entries(propertiesMatch).map(
        ([key, value]: [key: string, value: any]) => {
            return {
                key,
                ...value,
            };
        },
    );
    return propertiesFilterArray.map((prop: any) => {
        const numericalValue = parseInt(prop.value, 10);
        if (isNaN(numericalValue)) {
            return prop;
        }
        if (
            ['created_at', 'updated_at', 'start_date', 'end_date'].includes(
                prop.key,
            )
        ) {
            return {
                ...prop,
                value: startOfDay(add(new Date(), { days: numericalValue })),
            };
        }
        return {
            ...prop,
            value: numericalValue,
        };
    });
};

export const handleScheduledFilter = (prop: any, entity: any) => {
    const entityType = getEntityType(entity);

    let date = null;
    if (entityType === 'page') {
        if (entity.dailyDoc) {
            date = new Date(entity.dailyDoc);
        }
        if (entity.start && extractDate(entity.start)) {
            date = new Date(extractDate(entity.start));
        }
    }

    if (entityType === 'github') {
        if (entity.created_at) {
            date = new Date(entity.created_at);
        }
        if (entity.updated_at) {
            date = new Date(entity.updated_at);
        }
        if (entity.closed_at) {
            date = new Date(entity.closed_at);
        }
    }

    if (entityType === 'jira') {
        if (entity.properties?.created) {
            date = new Date(entity.properties.created);
        }
        if (entity.properties?.updated) {
            date = new Date(entity.properties.updated);
        }
    }

    return compareDate(prop, date);
};

export const handleMetaDateFilter = (prop: any, entity: any) => {
    const entityType = getEntityType(entity);
    let date = null;
    if (entityType === 'page') {
        if (entity.createdAt) {
            date = new Date(entity.createdAt);
        }
        if (entity.updatedAt) {
            date = new Date(entity.updatedAt);
        }
    }

    if (entityType === 'github') {
        if (entity.created_at) {
            date = new Date(entity.created_at);
        }
        if (entity.updated_at) {
            date = new Date(entity.updated_at);
        }
        if (entity.closed_at) {
            date = new Date(entity.closed_at);
        }
    }

    if (entityType === 'jira') {
        if (entity.properties?.created) {
            date = new Date(entity.properties.created);
        }
        if (entity.properties?.updated) {
            date = new Date(entity.properties.updated);
        }
    }
    return compareDate(prop, date);
};

export const handlePropertyFilter = (prop: any, entity: any, userData: any) => {
    const entityType = getEntityType(entity);
    if (entityType === 'page') {
        if (['assignee', 'creator'].includes(prop.key)) {
            return true;
        }
        if (prop.key === 'status') {
            return compare(prop, entity.pageStatus?.replace('_', ' '));
        }
        if (prop.key === 'type') {
            const type = entity.dailyDoc ? 'daily_doc' : 'page';
            return compare(prop, type);
        }
    }

    if (entityType === 'jira') {
        if (prop.key === 'assignee') {
            const userName =
                prop.value === 'you' ? userData.jira?.displayName : prop.value;
            return compare(
                { ...prop, value: userName ?? prop.value },
                entity.properties?.assignee?.displayName,
            );
        }
        if (prop.key === 'creator') {
            const userName =
                prop.value === 'you' ? userData.jira?.displayName : prop.value;
            return compare(
                { ...prop, value: userName ?? prop.value },
                entity.properties?.reporter?.displayName ?? prop.value,
            );
        }
        if (prop.key === 'status') {
            return compare(prop, entity.status);
        }
        if (prop.key === 'type') {
            return compare(prop, entity.type);
        }
    }

    if (entityType === 'github') {
        if (prop.key === 'assignee') {
            const userName =
                prop.value === 'you' ? userData.github?.login : prop.value;
            return compare(
                { ...prop, value: userName ?? prop.value },
                entity.assignee?.login,
            );
        }
        if (prop.key === 'creator') {
            const userName =
                prop.value === 'you' ? userData.github?.login : prop.value;
            return compare(
                { ...prop, value: userName ?? prop.value },
                entity.user?.login,
            );
        }
        if (prop.key === 'status') {
            return compare(prop, entity.state);
        }
        if (prop.key === 'type') {
            return compare(prop, translateGithubType(entity.type));
        }
    }
    return compare(prop, entity[prop.key]);
};

export const translateToAcreomType = (doc: {
    source: string;
    type: string;
}): any => {
    if (doc.source === 'acreom') {
        if (doc.type === 'My Day') {
            return SearchIndex.MY_DAY;
        }
        if (doc.type === 'page') {
            return SearchIndex.DOCUMENT;
        }
    }
    if (doc.source === 'jira') {
        return JiraIntegrationDataType.ISSUE;
    }
    if (doc.source === 'github') {
        if (doc.type === 'pull_request') {
            return GithubIntegrationDataType.PR;
        }
        if (doc.type === 'issue') {
            return GithubIntegrationDataType.ISSUE;
        }
    }
    return SearchIndex.DOCUMENT;
};

export const translateGithubType = (type: GithubIntegrationDataType) => {
    if (type === GithubIntegrationDataType.PR) {
        return 'pull_request';
    }
    if (type === GithubIntegrationDataType.ISSUE) {
        return 'issue';
    }
};

export const getEntityType = (entity: any) => {
    if (entity.dbTableName === 'documents') return 'page';
    if (entity.dbTableName === 'integrationData') {
        const id = entity.id.split('/')?.[0];
        if (id?.startsWith('jira') || id?.startsWith('github')) {
            return id.split('_')[0];
        }
        return id;
    }
    return entity.dbTableName;
};

export const compare = (prop: any, value: any) => {
    if (prop.operation === 'eq') {
        return value === prop.value;
    }
    if (prop.operation === 'neq') {
        return value !== prop.value;
    }
    if (prop.operation === 'gte') {
        return value >= prop.value;
    }
    if (prop.operation === 'lte') {
        return value <= prop.value;
    }
    return false;
};

export const compareDate = (prop: any, value: any) => {
    if (prop.operation === 'eq') {
        return isSameDay(value, prop.value);
    }
    if (prop.operation === 'neq') {
        return !isSameDay(value, prop.value);
    }
    if (prop.operation === 'gte') {
        return isAfter(value, prop.value) || isSameDay(value, prop.value);
    }
    if (prop.operation === 'lte') {
        return isBefore(value, prop.value) || isSameDay(value, prop.value);
    }
    return false;
};
