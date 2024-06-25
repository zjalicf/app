import EventEmitter from 'eventemitter3';

export enum ImporterEvents {
    PROGRESS = 'progress',
    ERROR = 'error',
    COMPLETE = 'complete',
}

export interface ProgressReporter {
    start(): void;
    progress(progress: number, total?: number): void;
    increaseTotal(total: number): void;
    done(): void;
    on: EventEmitter['on'];
}
