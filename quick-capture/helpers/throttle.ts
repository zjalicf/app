export const throttle = (timer: Function) => {
    let queuedCallback: Function | null = null;
    return (callback: any) => {
        if (!queuedCallback) {
            timer(() => {
                const cb = queuedCallback;
                queuedCallback = null;
                if (cb) cb();
            });
        }
        queuedCallback = callback;
    };
};
