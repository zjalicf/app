import Store from 'electron-store';
import {
    AssistantAssetFetchState,
    AssistantAssetState,
    ModelType,
    selectedModel,
} from './controls/constants';

export type ModelState = {
    model: ModelType;
    fetchStatus: AssistantAssetFetchState;
    state: AssistantAssetState;
    path: string | null;
};

export const assistantStore = new Store({ name: 'assistant-assets' });
export const getModelState = (): ModelState => {
    return assistantStore.get<any, ModelState>(selectedModel);
};

export const getStoreKey = (model: ModelType) => {
    return `model-state:${model}`;
};
