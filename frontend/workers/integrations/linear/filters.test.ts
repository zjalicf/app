import { describe, expect, it, vi } from 'vitest';
import { constructFiltersFromView } from '~/workers/integrations/linear/filters';

const complexView = {
    id: '239394ae-8742-4931-986d-f6b2a62646d9',
    editing: true,
    name: '',
    filters: [
        {
            property: 'state',
            operation: 'in',
            value: [
                'linear_AState/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a/6e6e6d20-e15e-40db-8252-98c5e8bffa10',
            ],
        },
        {
            property: 'assignee',
            operation: 'in',
            value: [
                'linear_AUser/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a/c0d4a3fd-9e8b-4330-bb88-de636f17c754',
                'linear_AUser/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a/3540f6b3-a94f-4f38-ab6d-cfb9cdbc2144',
            ],
        },
        {
            property: 'project',
            operation: 'in',
            value: [
                'linear_AProject/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a/c8017f35-f5d9-4350-93fc-22050ab6c3f6',
                'linear_AProject/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a/c65835dc-5514-4689-9d18-efc1bae0b85c',
            ],
        },
    ],
    displayProperties: [
        'priority',
        'status',
        'key',
        'labels',
        'createdAt',
        'assignee',
        'project',
        'clip',
    ],
    groupBy: 'priority',
    sortBy: 'priority',
    sortDirection: 'descending',
    teamId: 'linear_ATeam/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a',
};

const simpleView = {
    id: '112009b5-f330-4af5-9719-8af4852cc2d7',
    editing: false,
    name: 'View Test',
    filters: [
        {
            property: 'labels',
            operation: 'includes',
            value: [
                'linear_ALabel/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a/e98c4fb1-ef1b-4df4-b1a2-549a467a0c16',
                'linear_ALabel/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a/701bae51-94d6-459f-b90d-5a94013a7e76',
            ],
        },
    ],
    displayProperties: [
        'priority',
        'status',
        'key',
        'labels',
        'createdAt',
        'assignee',
        'project',
        'clip',
    ],
    groupBy: 'priority',
    sortBy: 'priority',
    sortDirection: 'descending',
    teamId: 'linear_ATeam/799a1a88-f05b-4c9a-8470-796de035c09e/c3e06292-c949-4538-b6e8-feee050e030a',
};

const integrationMock = { data: { teams: ['abc'] } } as any;

const createFilters = (...filters: any[]) => {
    return {
        filters,
    };
};

describe('Linear filters', () => {
    it('should construct filters from include filter', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'labels',
                operation: 'includes',
                value: ['abc', 'efg'],
            }),
        );

        expect(linearFilter).toEqual({
            labels: {
                and: [{ id: { eq: 'abc' } }, { id: { eq: 'efg' } }],
            },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct filters from eq filter', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'project',
                operation: 'eq',
                value: 'abc',
            }),
        );

        expect(linearFilter).toEqual({
            project: { id: { eq: 'abc' } },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct multiple filters from eq filter', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters(
                {
                    property: 'project',
                    operation: 'eq',
                    value: 'abc',
                },
                {
                    property: 'assignee',
                    operation: 'eq',
                    value: 'efg',
                },
            ),
        );

        expect(linearFilter).toEqual({
            project: { id: { eq: 'abc' } },
            assignee: { id: { eq: 'efg' } },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct filters from neq filter', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'project',
                operation: 'neq',
                value: 'abc',
            }),
        );

        expect(linearFilter).toEqual({
            project: { id: { neq: 'abc' } },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct filters from in filter', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'project',
                operation: 'in',
                value: ['abc', 'efg'],
            }),
        );

        expect(linearFilter).toEqual({
            project: { id: { in: ['abc', 'efg'] } },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct filters from nin filter', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'project',
                operation: 'nin',
                value: ['abc', 'efg'],
            }),
        );

        expect(linearFilter).toEqual({
            project: { id: { nin: ['abc', 'efg'] } },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should gather teams from integration', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters(),
        );

        expect(linearFilter).toEqual({
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct team filter from view', () => {
        const linearFilter = constructFiltersFromView(integrationMock, {
            teamId: 'efg',
            ...createFilters(),
        });

        expect(linearFilter).toEqual({
            team: { id: { eq: 'efg' } },
        });
    });

    it('should construct filter with null', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'project',
                operation: 'in',
                value: [null],
            }),
        );

        expect(linearFilter).toEqual({
            project: {
                null: true,
            },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct filter with null in', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'project',
                operation: 'in',
                value: [null],
            }),
        );

        expect(linearFilter).toEqual({
            project: {
                null: true,
            },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct filter with statusType', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'stateType',
                operation: 'in',
                value: ['a', 'b'],
            }),
        );

        expect(linearFilter).toEqual({
            state: {
                type: {
                    in: ['a', 'b'],
                },
            },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct filter with null in with other values', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'project',
                operation: 'in',
                value: [null, 'abcd'],
            }),
        );

        expect(linearFilter).toEqual({
            project: {
                or: [{ id: { in: ['abcd'] } }, { null: true }],
            },
            team: { id: { in: ['abc'] } },
        });
    });

    it('shold construct priority filter', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            createFilters({
                property: 'priority',
                operation: 'in',
                value: ['dasd/1', 'das/2'],
            }),
        );

        expect(linearFilter).toEqual({
            priority: {
                in: [1, 2],
            },
            team: { id: { in: ['abc'] } },
        });
    });

    it('should construct filters from simple view', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            simpleView,
        );

        const expectedFilter = {
            labels: {
                and: [
                    { id: { eq: 'e98c4fb1-ef1b-4df4-b1a2-549a467a0c16' } },
                    { id: { eq: '701bae51-94d6-459f-b90d-5a94013a7e76' } },
                ],
            },
            team: { id: { eq: 'c3e06292-c949-4538-b6e8-feee050e030a' } },
        };

        expect(linearFilter).toEqual(expectedFilter);
    });

    it('should construct filters from complex view', () => {
        const linearFilter = constructFiltersFromView(
            integrationMock,
            complexView,
        );

        const expectedFilter = {
            state: {
                id: {
                    in: ['6e6e6d20-e15e-40db-8252-98c5e8bffa10'],
                },
            },
            assignee: {
                id: {
                    in: [
                        'c0d4a3fd-9e8b-4330-bb88-de636f17c754',
                        '3540f6b3-a94f-4f38-ab6d-cfb9cdbc2144',
                    ],
                },
            },
            project: {
                id: {
                    in: [
                        'c8017f35-f5d9-4350-93fc-22050ab6c3f6',
                        'c65835dc-5514-4689-9d18-efc1bae0b85c',
                    ],
                },
            },
            team: { id: { eq: 'c3e06292-c949-4538-b6e8-feee050e030a' } },
        };
        expect(linearFilter).toEqual(expectedFilter);
    });
});
