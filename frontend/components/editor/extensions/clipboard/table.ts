export const constructTable = (tableContent: string[][]) => {
    return tableContent.reduce((acc, row) => {
        return acc + '| ' + row.join(' | ') + ' |\n';
    }, '');
};
