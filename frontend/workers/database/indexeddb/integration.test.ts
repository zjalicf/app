import { describe, it } from 'vitest';
import { customDefaultsDeep } from '~/workers/database/indexeddb/integrations';

describe('integration', () => {
    it('merge objects', ({ expect }) => {
        const date = new Date();
        const oldTs = new Date(10 * 60 * 60 * 1000);
        const incomingChange = {
            id: '123',
            data: {
                teams: ['acreom', 'test'],
            },
            updatedAt: date,
            booleanTest: true,
        };

        const existingIntegration = {
            id: '123',
            type: 'integration',
            data: {
                myself: {
                    id: 'adam',
                },
                teams: [],
            },
            updatedAt: oldTs,
            booleanTest: false,
            test: [],
        };

        const merged = customDefaultsDeep(incomingChange, existingIntegration);

        expect(merged).to.deep.equal({
            id: '123',
            type: 'integration',
            data: {
                myself: {
                    id: 'adam',
                },
                teams: ['acreom', 'test'],
            },
            updatedAt: date,
            booleanTest: true,
            test: [],
        });
    });
});
