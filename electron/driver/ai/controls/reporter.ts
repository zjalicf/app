import EventEmitter from 'node:events';
import debounce from 'lodash/debounce';
import { initializeModel } from '../index';
import { ModelType, ReporterProgressState } from './constants';

export class ProgressReporter extends EventEmitter {
    total: number;
    startLoaded: number;
    loaded: number;
    startTime: Date | null;
    modelType: ModelType;

    constructor(model: ModelType) {
        super();
        this.modelType = model;
        this.startTime = null;

        this.progressEmit = debounce(this.progressEmit, 500, {
            leading: true,
            trailing: true,
            maxWait: 1000,
        });
    }

    progressEmit(loaded: number, total: number) {
        const elapsedTime = Date.now() - this.startTime.getTime();
        const loadedSoFar = loaded - this.startLoaded;
        const remainingTime = (elapsedTime / loadedSoFar) * (total - loaded);
        this.emit(ReporterProgressState.PROGRESS, {
            loaded,
            total,
            remainingTime,
        });
    }

    initialize(start: number, total: number) {
        this.total = total;
        this.startLoaded = start;
        this.loaded = start;
        this.startTime = new Date();
    }

    error(error: string) {
        this.emit(ReporterProgressState.ERROR, error);
    }

    progress(chunkSize: number) {
        this.loaded += chunkSize;
        this.progressEmit(this.loaded, this.total);
    }

    end() {
        this.startTime = null;
        this.total = 0;
        this.loaded = 0;
        this.emit(ReporterProgressState.END);

        initializeModel();
    }
}
