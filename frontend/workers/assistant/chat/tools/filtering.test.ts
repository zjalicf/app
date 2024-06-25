import { describe, expect, it } from 'vitest';
import { isSameDay } from 'date-fns';
import {
    getEntityType,
    preparePropertiesFilters,
    propertiesFilter,
} from '~/workers/assistant/chat/tools/filtering';
import { JiraIntegrationDataType } from '~/constants/jira';
import { GithubIntegrationDataType } from '~/components/github/github';

describe('properties filtering', () => {
    const entitiesWithDate = [
        {
            id: '1',
            title: 'daily doc 1',
            dailyDoc: '2024-01-12',
            dbTableName: 'documents',
        },
        {
            id: '2',
            title: 'daily doc 2',
            dailyDoc: '2024-01-08',
            dbTableName: 'documents',
        },
        {
            id: '3',
            title: 'daily doc 3',
            dailyDoc: '2024-01-01',
            dbTableName: 'documents',
        },
        {
            id: '4',
            title: 'doc with date',
            start: {
                date: '2024-01-12',
            },
            dbTableName: 'documents',
        },
    ];

    it('should return correct entity type', () => {
        expect(getEntityType({ dbTableName: 'documents' })).toBe('page');
        expect(
            getEntityType({
                id: [JiraIntegrationDataType.ISSUE, 'ab'].join('/'),
                dbTableName: 'integrationData',
            }),
        ).toBe('jira');
        expect(
            getEntityType({
                id: [GithubIntegrationDataType.PR, 'ab'].join('/'),
                dbTableName: 'integrationData',
            }),
        ).toBe('github');
        expect(
            getEntityType({
                id: [GithubIntegrationDataType.ISSUE, 'ab'].join('/'),
                dbTableName: 'integrationData',
            }),
        ).toBe('github');
    });

    it('should prepare properties filters', () => {
        const preparedProperties = preparePropertiesFilters({
            start_date: {
                operation: 'gte',
                value: -7,
            },
            end_date: {
                operation: 'lte',
                value: 0,
            },
        });
        expect(preparedProperties.length).toBe(2);
        expect(preparedProperties[0].key).toBe('start_date');
        expect(preparedProperties[0].operation).toBe('gte');
        expect(preparedProperties[0].value).toBeInstanceOf(Date);
        // expect(
        //     isSameDay(preparedProperties[0].value, new Date('2024-01-05')),
        // ).toBe(true);
        expect(preparedProperties[1].key).toBe('end_date');
        expect(preparedProperties[1].operation).toBe('lte');
        expect(preparedProperties[1].value).toBeInstanceOf(Date);
        // expect(
        //     isSameDay(preparedProperties[1].value, new Date('2024-01-12')),
        // ).toBe(true);
    });

    it('should match date filters', () => {
        const output = propertiesFilter(
            entitiesWithDate,
            {
                start_date: {
                    operation: 'gte',
                    value: -7,
                },
                end_date: {
                    operation: 'lte',
                    value: 0,
                },
            },
            {},
        );
        // expect(output.length).toBe(3);
        // expect(output[0].id).toBe('1');
        // expect(output[1].id).toBe('2');
        // expect(output[2].id).toBe('4');
    });
});
