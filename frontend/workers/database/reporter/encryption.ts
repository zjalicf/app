import EventEmitter from 'eventemitter3';
import { ProgressReporter, ImporterEvents } from './interface';
import { WorkerContext } from '~/@types/app';

export class EncryptionReporter
    extends EventEmitter
    implements ProgressReporter
{
    context: WorkerContext;
    loaded = 0;
    total = 0;
    startMs = Date.now();
    vaultId: string;

    constructor(ctx: WorkerContext, vaultId: string) {
        super();
        this.context = ctx;
        this.vaultId = vaultId;
    }

    start() {
        this.loaded = 0;
        this.total = 0;
        this.startMs = Date.now();
    }

    increaseTotal(total: number) {
        this.total += total;
    }

    progress(progress: number, total?: number) {
        if (total !== undefined) {
            this.total = total;
        }
        this.loaded += progress;

        const timeElapsed = Date.now() - this.startMs;
        const timeRemaining =
            (timeElapsed / this.loaded) * (this.total - this.loaded);
        this.emit(ImporterEvents.PROGRESS, {
            vaultId: this.vaultId,
            total: this.total,
            loaded: this.loaded,
            timeRemaining: Math.ceil(timeRemaining / 1000),
            timeElapsed: Math.floor(timeElapsed / 1000),
            timestamp: Date.now(),
        });
    }

    done() {
        this.emit(ImporterEvents.COMPLETE, {
            vaultId: this.vaultId,
            timestamp: Date.now(),
            total: this.total,
            loaded: this.loaded,
        });
        this.loaded = 0;
        this.total = 0;
    }
}
