export enum ModelType {
    NeuralChat7bV3_1 = 'neural-chat-7b-v3-1.Q5_K_M.gguf',
    OpenChat3_5 = 'openchat_3.5.Q5_K_M.gguf',
}

export const selectedModel: ModelType = ModelType.OpenChat3_5;

export enum AssistantAssetProgress {
    FETCH_MODEL_ERROR = 'fetch-model-error',
    FETCH_MODEL_PROGRESS = 'fetch-model-progress',
    FETCH_MODEL_END = 'fetch-model-end',
}

export enum AssistantAssetFetchState {
    NOT_STARTED = 'not-started',
    IN_PROGRESS = 'in-progress',
    ERROR = 'error',
    SUCCESS = 'success',
}

export enum AssistantAssetState {
    NOT_READY = 'not-ready',
    READY = 'ready',
}

export enum ReporterProgressState {
    PROGRESS = 'progress',
    ERROR = 'error',
    END = 'end',
}
