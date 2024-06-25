type Executor = () => Promise<any | void>;

export class AtomicQueue {
    protected queue: any[] = [];
    private isProcessing: boolean = false;
    private onCompleteCallback = () => {};

    public execute(fn: any) {
        this.queue.push(fn);
        this.process();
    }

    protected get executor(): any | undefined {
        return this.queue.shift();
    }

    protected async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        while (this.queue.length > 0) {
            try {
                const executor = this.executor;
                await executor?.();
            } catch (e) {
                // TODO: add error handling in the future
                //  this is good enough for now as it "handles" the error the same as before
                //  skip entries throwing errors for now
                //  we should probably do some graceful failure and rollback the change
            }
        }
        this.isProcessing = false;
        this.onCompleteCallback?.();
    }

    awaitQueueFinish() {
        return new Promise<void>(resolve => {
            this.onCompleteCallback = () => resolve();
        });
    }
}

export class ConditionAtomicQueue extends AtomicQueue {
    protected queue: { fn: Executor; id: string }[] = [];

    protected get executor(): (() => Promise<void>) | undefined {
        const executor = this.queue.shift();
        return executor?.fn;
    }

    public execute(executable: { fn: () => Promise<void>; id: string }) {
        if (this.queue.length > 1 && this.queue[0].id === executable.id) {
            this.queue.pop();
            this.process();
            return;
        }
        this.queue.push(executable);
        this.process();
    }
}
