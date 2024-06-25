import { createWriteStream, statSync, rm, mkdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'stream';
import { parse } from 'path';
import { accessSync, constants } from 'fs';
import axios, { Canceler } from 'axios';
import { app } from 'electron';
import { ProgressReporter } from './reporter';
import { ModelType } from './constants';

export class AssistantAssetManager {
    private cancel: Canceler | null;

    public async fetchModel(
        model: ModelType,
        progressReporter?: ProgressReporter,
    ) {
        this.validateModelType(model);
        const start = this.getDownloadedSize(model);
        const modelUri = this.getModelUri(model);
        const modelPath = this.getModelLocalPath(model);

        const headers: Record<string, string> = {
            'Content-Type': 'application/octet-stream',
            'Accept-Encoding': 'gzip',
            'Cache-Control': 'no-store',
            Range: `bytes=${start}-`,
        };

        const response = await axios.get(modelUri, {
            headers,
            responseType: 'stream',
            cancelToken: new axios.CancelToken(cancel => {
                this.cancel = cancel;
            }),
        });

        if (response.status > 299) {
            progressReporter.error(response.statusText);
            return;
        }

        const totalSize = Number(response.headers['content-length']) + start;
        let currentSize = start;
        let lastReportedSize = start;

        const interval = setInterval(() => {
            progressReporter.progress(currentSize - lastReportedSize);
            lastReportedSize = currentSize;
        }, 1000);

        progressReporter.initialize(start, totalSize);
        const reporterStream = new Transform({
            transform(chunk: any, _encoding: BufferEncoding, callback) {
                currentSize += chunk.length;
                this.push(chunk);
                callback();
            },
        });
        this.createDirIfNotExists(modelPath);
        try {
            accessSync(modelPath, constants.F_OK | constants.W_OK);
        } catch (e) {
            console.log(e);
        }
        const writerStream = createWriteStream(modelPath, {
            flags: 'a',
        });
        response.data.on('end', () => {
            clearInterval(interval);
            progressReporter.end();
        });

        pipeline(response.data, reporterStream, writerStream).catch(e => {
            clearInterval(interval);
            console.log(e);
        });
    }

    public cancelFetch() {
        if (this.cancel) {
            this.cancel();
        }
        this.deleteModel(ModelType.NeuralChat7bV3_1);
    }

    private validateModelType(model: ModelType) {
        if (!Object.values(ModelType).includes(model)) {
            throw new Error('Invalid model type');
        }
    }

    private getDownloadedSize(model: ModelType) {
        try {
            const stats = statSync(this.getModelLocalPath(model));
            return stats.size;
        } catch (err) {
            return 0;
        }
    }

    private getModelUri(model: ModelType) {
        return ['https://storage.googleapis.com/acreom-models', model].join(
            '/',
        );
    }

    private createDirIfNotExists(modelPath: string) {
        const parsedPath = parse(modelPath);
        try {
            mkdirSync(parsedPath.dir, { recursive: true });
        } catch (err) {
            console.log('Error creating model directory');
        }
    }

    public getModelLocalPath(model: ModelType) {
        return [app.getPath('userData'), 'models', model].join('/');
    }

    public deleteModel(model: ModelType) {
        if (this.cancel) {
            this.cancel();
        }
        const modelPath = this.getModelLocalPath(model);
        try {
            rm(modelPath, err => {
                if (err) {
                    console.log('Error deleting model file');
                }
            });
        } catch (err) {
            console.log('Model file not found');
        }
    }
}
