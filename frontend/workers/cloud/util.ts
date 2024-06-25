export const networkErrorHandler = (code: string) => {
    return {
        data: null as any,
        status: -1,
        statusText: code,
    };
};
