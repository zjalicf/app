export const filterLinearIssuesByView = (issues: any[], view: any): any[] => {
    let output = issues;
    for (const filter of view.filters) {
        if (filter.property === 'none') continue;
        output = filterLinearIssues(output, filter);
    }
    return output;
};

export const filterLinearIssues = (issues: any[], filter: any) => {
    const output = [];
    const property = filter.property;
    const value = filter.value;
    const operation = filter.operation;
    const isMultiValue = Array.isArray(value);

    for (const issue of issues) {
        const issueValue = issue[property];
        if (operation === 'includes') {
            if (!value?.length) {
                output.push(issue);
                continue;
            }
            if (
                Array.isArray(issueValue) &&
                value.every((val: any) => issueValue.includes(val))
            ) {
                output.push(issue);
                continue;
            }
            if (value.includes(issueValue)) {
                output.push(issue);
            }
            continue;
        }
        if (operation === 'in') {
            if (!value?.length) {
                output.push(issue);
                continue;
            }
            if (
                Array.isArray(issueValue) &&
                value.some((val: any) => issueValue.includes(val))
            ) {
                output.push(issue);
                continue;
            }
            if (value.includes(issueValue)) {
                output.push(issue);
            }
            continue;
        }
        if (operation === 'eq' && issueValue === value) {
            output.push(issue);
        }
        if (operation === 'neq' || operation === 'nin') {
            if (!isMultiValue && issueValue !== value) {
                output.push(issue);
            }
            if (
                isMultiValue &&
                !Array.isArray(issueValue) &&
                !value.includes(issueValue)
            ) {
                output.push(issue);
            }
            if (
                isMultiValue &&
                Array.isArray(issueValue) &&
                !value.some((val: any) => issueValue.includes(val))
            ) {
                output.push(issue);
            }
        }
    }
    return output;
};
