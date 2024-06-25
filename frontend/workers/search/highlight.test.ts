import { describe, it, expect } from 'vitest';
import { getResultHighlights } from '~/workers/search/highlight';

const searchObject = {
    terms: ['test', 'sdsd'],
    match: {
        test: ['labels'],
        sdsd: ['labels'],
    },
    title: 'dfdfd',
    content:
        '- [ ] Test  start:date:1704582000000 end:date:1704668400000\n\n\n\n#test/sdsd',
    vaultId: '120119ab-6549-49da-8e42-2afc7a70b2e7',
    labels: ['#test/sdsd'],

    entityType: 'document',
    query: '#test/s',
};

describe('Search highlight', () => {
    it('should highlight labels with /', () => {
        const highlight = getResultHighlights(
            searchObject.labels.join(' '),
            searchObject,
            'labels',
        );

        expect(highlight).toEqual([
            { highlight: false, text: '' },
            { highlight: true, text: '#test/s' },
            { highlight: false, text: 'dsd' },
        ]);
    });
});
