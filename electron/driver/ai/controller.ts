import { AddressInfo, createServer } from 'net';
import { join, parse } from 'path';
import { credentials } from '@grpc/grpc-js';
import execa from 'execa';
import { add } from 'date-fns';
import { appWindows } from '../../app';
import { isMac, isWindows } from '../../helpers';
import { AiAssistantOptions } from '../../../frontend/@types';
import { com } from './grpc/ai';

import { getModelState } from './store';
import IndexRequest = com.acreom.ai.IndexRequest;
import IndexReply = com.acreom.ai.IndexReply;
import AIClient = com.acreom.ai.AIClient;
import EntityData = com.acreom.ai.EntityData;
import TaskRequest = com.acreom.ai.TaskRequest;
import TaskReply = com.acreom.ai.TaskReply;
import InitializeRequest = com.acreom.ai.InitializeRequest;
import InitializeReply = com.acreom.ai.InitializeReply;

const RETRIES_COUNT = 5;

export class AcreomAI {
    private aiProcess: execa.ExecaChildProcess | null = null;
    private client!: AIClient;

    private connected: boolean = false;
    private isDev: boolean = false;
    private port: number = 12346;

    private shouldQuit: boolean = false;
    private retries = 0;
    private retryTimeout: any = 0;

    constructor(ARGS: Record<string, any>) {
        this.isDev = !!ARGS.dev;
    }

    get isActive(): boolean {
        return this.connected;
    }

    get path() {
        const directory = isMac ? 'mac-arm64' : isWindows ? 'windows' : 'linux';
        return this.isDev
            ? join(__dirname, '../', 'Assets', directory, 'ai-assistant')
            : join(process.resourcesPath, 'Assets', 'ai-assistant');
    }

    get address() {
        return `127.0.0.1:${this.port}`;
    }

    initialize(path: string): Promise<InitializeReply> {
        const parsedPath = parse(path);
        const request = new InitializeRequest({
            model_path: path,
            embedding_path: parsedPath.dir,
        });

        return new Promise<InitializeReply>((resolve, reject) => {
            this.client.Initialize(request, (err, response) => {
                if (err) {
                    return reject(err);
                }
                resolve(response);
            });
        }).then(response => {
            return response;
        });
    }

    index(vaultId: string, action: string, data: any[]) {
        const request = new IndexRequest({
            vault_id: vaultId,
            action,
            data: data.map(d => new EntityData(d)),
        });

        return new Promise<IndexReply>((resolve, reject) => {
            this.client.Index(request, (err, response) => {
                if (err) {
                    return reject(err);
                }
                resolve(response);
            });
        });
    }

    process(text: string, options: AiAssistantOptions) {
        const request = new TaskRequest({
            data: text,
            tasks: options.tasks,
            context: options.context,
        });
        return new Promise<TaskReply>((resolve, _reject) => {
            let reply = '';
            let sourceDocuments = {};
            const stream = this.client.Task(request);
            stream.on('data', data => {
                sourceDocuments = data.toObject().sourceDocuments;
                reply = data.toObject().text;
                appWindows.main?.webContents.send('ai-stream-data', { reply });
                appWindows.main?.webContents.send('ai-emit-source-documents', {
                    sourceDocuments,
                });
            });
            stream.on('end', () => {
                appWindows.main?.webContents.send('ai-stream-end');
                const finalMessage = new TaskReply({ text: reply });
                appWindows.main?.webContents.send('ai-stream-final', { reply });
                resolve(finalMessage);
            });
        });
    }

    async start() {
        this.port = await this.getPort();
        this.aiProcess = execa(this.path, [this.port.toString()]);
        await new Promise(resolve => setTimeout(resolve, 10_000));
        this.aiProcess?.on('exit', _code => {
            this.connected = false;
            if (!this.shouldQuit && this.retries < RETRIES_COUNT) {
                this.restart();
            }
        });
    }

    async connect() {
        this.client = new AIClient(this.address, credentials.createInsecure());
        console.log('connecting to ai client');
        return new Promise<boolean>((resolve, reject) => {
            this.client.waitForReady(add(new Date(), { seconds: 120 }), err => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                console.log('Assistant GRPC initialized');
                this.initializeExecutable();
                this.connected = true;
                resolve(true);
            });
        }).catch(() => {
            this.connected = false;
            return false;
        });
    }

    async initializeExecutable() {
        const modelState = getModelState();
        if (modelState?.state !== 'ready') {
            return;
        }
        await this.initialize(modelState.path);
    }

    private async restart() {
        try {
            this.retries++;
            this.connected = false;
            clearTimeout(this.retryTimeout);
            this.retryTimeout = setTimeout(() => {
                this.retries = 0;
            }, 20 * 1000);
            this.aiProcess.kill();
            await this.start();
        } catch (e) {}
    }

    private getPort(): Promise<number> {
        const srv = createServer();
        return new Promise(resolve => {
            srv.listen(0, () => {
                const port = (srv.address() as AddressInfo).port;
                srv.close(() => {
                    resolve(port);
                });
            });
        });
    }
}
