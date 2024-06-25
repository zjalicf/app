import { IpcMain } from 'electron';
import { appWindows } from '../../../app';
import { DEVICE_ACTIONS } from '../../../constants/electron-constants';
import { assistantStore, getStoreKey, ModelState } from '../store';
import { ProgressReporter } from './reporter';
import { AssistantAssetManager } from './asset-manager';
import {
    AssistantAssetFetchState,
    AssistantAssetProgress,
    AssistantAssetState,
    ReporterProgressState,
    selectedModel,
} from './constants';

const modelKey = getStoreKey(selectedModel);
const assistantAssetManager = new AssistantAssetManager();

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    if (!assistantStore.has(modelKey)) {
        assistantStore.set(modelKey, {
            model: selectedModel,
            fetchStatus: AssistantAssetFetchState.NOT_STARTED,
            state: AssistantAssetState.NOT_READY,
            path: null,
        });
    }

    ipcMain.handle(DEVICE_ACTIONS.ASSISTANT_ASSET_STATUS, () => {
        return assistantStore.get(modelKey);
    });

    ipcMain.on(DEVICE_ACTIONS.ASSISTANT_ASSET_FETCH, () => {
        const progressReporter = new ProgressReporter(selectedModel);
        progressReporter.on(ReporterProgressState.ERROR, error => {
            assistantStore.set(modelKey, {
                model: selectedModel,
                fetchStatus: AssistantAssetFetchState.ERROR,
                state: AssistantAssetState.NOT_READY,
                path: null,
            });
            appWindows.main.webContents.send(
                AssistantAssetProgress.FETCH_MODEL_ERROR,
                error,
            );
        });
        progressReporter.on(ReporterProgressState.PROGRESS, progress => {
            const storedState = assistantStore.get<any, ModelState>(modelKey);
            if (
                storedState.fetchStatus !== AssistantAssetFetchState.IN_PROGRESS
            ) {
                assistantStore.set(modelKey, {
                    model: selectedModel,
                    fetchStatus: AssistantAssetFetchState.IN_PROGRESS,
                    state: AssistantAssetState.NOT_READY,
                    path: assistantAssetManager.getModelLocalPath(
                        selectedModel,
                    ),
                });
            }
            appWindows.main.webContents.send(
                AssistantAssetProgress.FETCH_MODEL_PROGRESS,
                progress,
            );
        });
        progressReporter.on(ReporterProgressState.END, () => {
            assistantStore.set(modelKey, {
                model: selectedModel,
                fetchStatus: AssistantAssetFetchState.SUCCESS,
                state: AssistantAssetState.READY,
                path: assistantAssetManager.getModelLocalPath(selectedModel),
            });
            appWindows.main.webContents.send(
                AssistantAssetProgress.FETCH_MODEL_END,
            );
        });

        assistantAssetManager.fetchModel(selectedModel, progressReporter);
    });

    ipcMain.on(DEVICE_ACTIONS.ASSISTANT_ASSET_FETCH_CANCEL, () => {
        assistantStore.set(modelKey, {
            model: selectedModel,
            fetchStatus: AssistantAssetFetchState.NOT_STARTED,
            state: AssistantAssetState.NOT_READY,
            path: null,
        });
        assistantAssetManager.cancelFetch();
        appWindows.main.webContents.send(
            AssistantAssetProgress.FETCH_MODEL_END,
        );
    });

    ipcMain.on(DEVICE_ACTIONS.ASSISTANT_ASSET_DELETE, () => {
        assistantStore.set(modelKey, {
            model: selectedModel,
            fetchStatus: AssistantAssetFetchState.NOT_STARTED,
            state: AssistantAssetState.NOT_READY,
            path: null,
        });
        assistantAssetManager.deleteModel(selectedModel);
    });
};
