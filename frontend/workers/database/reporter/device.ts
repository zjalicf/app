import EventEmitter from 'eventemitter3';
import { ProgressReporter, ImporterEvents } from './interface';
import { WorkerContext } from '~/@types/app';

export class DeviceReporter extends EventEmitter implements ProgressReporter {
    context: WorkerContext;
    loaded = 0;
    total = 0;
    data: any[] = [];
    unsupported = 0;
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
        this.unsupported = 0;
        this.data = [];
        this.startMs = Date.now();
    }

    addData(data: any) {
        if (Array.isArray(data)) {
            this.data.push(...data);
            return;
        }
        this.data.push(data);
    }

    increaseUnsupported(unsupported: number = 1) {
        this.unsupported += unsupported;
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
            unsupported: this.unsupported,
            data: this.data,
            loaded: this.loaded,
        });
        this.loaded = 0;
        this.total = 0;
        this.unsupported = 0;
        this.data = [];
    }
}
