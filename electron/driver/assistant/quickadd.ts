import { join } from 'path';
import { AddressInfo, createServer } from 'net';
import { app, IpcMain, IpcMainEvent } from 'electron';
import { credentials } from '@grpc/grpc-js';
import execa from 'execa';
import { add } from 'date-fns';
import { DEVICE_ACTIONS } from '../../constants/electron-constants';
import { scopedLogger } from '../../helpers/logger';
import { isMac, isWindows } from '../../helpers';
import { QuickaddOptions } from '../../../frontend/@types';
import { com } from './grpc/assistant';
import AcreomAssistantClient = com.acreom.assistant.AcreomAssistantClient;
import QuickaddRequest = com.acreom.assistant.QuickaddRequest;
import QuickaddReply = com.acreom.assistant.QuickaddReply;

const logger = scopedLogger('assistant');
const RETRIES_COUNT = 5;

class AcreomAssistant {
    private assistantProcess: execa.ExecaChildProcess | null = null;

    private path: string = '';
    private port: number = 12345;
    private grpcClient: AcreomAssistantGRPC;

    private shouldQuit: boolean = false;
    private started: boolean = false;
    private active: boolean = false;

    private retries: number = 0;
    private retryTimeout: any = 0;

    get address() {
        return `127.0.0.1:${this.port}`;
    }

    initialize(_ipcMain: IpcMain, ARGS: Record<string, any>) {
        app?.on('before-quit', () => {
            this.shouldQuit = true;
        });
        const directory = isMac ? 'mac-arm64' : isWindows ? 'windows' : 'linux';
        this.path = ARGS.dev
            ? join(
                  __dirname,
                  '../',
                  'Assets',
                  directory,
                  'acreom_assistant',
                  'acreom-assistant',
              )
            : join(
                  process.resourcesPath,
                  'Assets',
                  'acreom_assistant',
                  'acreom-assistant',
              );
    }

    isActive(): boolean {
        return this.active;
    }

    async start() {
        if (this.started) return;
        this.started = true;
        this.port = await this.getPort();
        console.log('starting quickadd', this.port);

        this.assistantProcess = execa(this.path, [`--port=${this.port}`]);

        this.assistantProcess?.on('error', err => {
            this.active = false;
            if (!this.shouldQuit && this.retries < RETRIES_COUNT) {
                this.restart();
            }
            logger.error({
                operation: 'error Quickadd',
                message: err,
            });
        });

        this.assistantProcess?.on('exit', code => {
            this.active = false;
            if (!this.shouldQuit && this.retries < RETRIES_COUNT) {
                this.restart();
            }
            logger.error({
                operation: 'exit Quickadd',
                message: code,
            });
        });

        this.assistantProcess?.on('close', reason => {
            this.active = false;
            if (!this.shouldQuit && this.retries < RETRIES_COUNT) {
                this.restart();
            }
            logger.error({
                operation: 'close Quickadd',
                message: reason,
            });
        });

        this.assistantProcess?.on('disconnect', (reason: number) => {
            this.active = false;
            if (!this.shouldQuit && this.retries < RETRIES_COUNT) {
                this.restart();
            }
            logger.error({
                operation: 'disconnect Quickadd',
                message: reason,
            });
        });

        this.grpcClient = new AcreomAssistantGRPC(this.address);
        await new Promise<void>((resolve, reject) => {
            this.grpcClient.client.waitForReady(
                add(new Date(), { seconds: 60 }),
                err => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    console.log('Quickadd GRPC initialized');
                    resolve();
                },
            );
        })
            .then(() => {
                this.active = true;
            })
            .catch(() => {
                this.active = false;
            });
    }

    async quickadd(text: string, timestamp: string, options: QuickaddOptions) {
        const response = await this.grpcClient.quickadd(
            text,
            timestamp,
            options,
        );
        return response.toObject();
    }

    private async restart() {
        try {
            this.retries++;
            this.started = false;
            clearTimeout(this.retryTimeout);
            this.retryTimeout = setTimeout(() => {
                this.retries = 0;
            }, 20 * 1000);
            this.assistantProcess.kill();
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

export const acreomAssistant = new AcreomAssistant();

class AcreomAssistantGRPC {
    client: AcreomAssistantClient;
    constructor(address: string) {
        this.client = new AcreomAssistantClient(
            address,
            credentials.createInsecure(),
        );
    }

    quickadd(text: string, timestamp: string, options: QuickaddOptions) {
        const request = new QuickaddRequest({
            data: text,
            ts: timestamp,
            date_format: options.date_format,
            pm_bias: options.pm_bias,
            fallback: false,
        });

        return new Promise<QuickaddReply>((resolve, reject) => {
            this.client.Quickadd(request, (err, response) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                resolve(response);
            });
        });
    }
}

export const registerQuickaddService = (ipcMain: IpcMain, ARGS: any) => {
    acreomAssistant.initialize(ipcMain, ARGS);
    acreomAssistant.start();
    quickaddHandler(ipcMain);
};

const quickaddHandler = (ipcMain: IpcMain) => {
    ipcMain?.handle(
        DEVICE_ACTIONS.ASSISTANT_QUICKADD,
        async (
            _event: IpcMainEvent,
            {
                data,
                ts,
                options,
            }: { data: string; ts: string; options: QuickaddOptions },
        ) => {
            return await acreomAssistant.quickadd(data, ts, options);
        },
    );
    ipcMain?.handle(DEVICE_ACTIONS.ASSISTANT_ACTIVE, () => {
        return acreomAssistant.isActive();
    });
};
