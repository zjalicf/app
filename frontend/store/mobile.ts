import { KeyboardState } from '~/constants/mobile';

interface AppState {
    willShow: boolean;
    keyboardHeight: number;
    keyboardState: KeyboardState;
}

export const state: () => AppState = () => ({
    willShow: false,
    keyboardHeight: 300,
    keyboardState: KeyboardState.DID_HIDE,
});

export const getters = {
    willShow: (state: AppState) => state.willShow,
    keyboardHeight: (state: AppState) => state.keyboardHeight,
    keyboardState: (state: AppState) => state.keyboardState,
};

export const mutations = {
    setWillShow(state: AppState, willShow: boolean) {
        state.willShow = willShow;
    },
    setKeyboardHeight(state: AppState, value: number) {
        state.keyboardHeight = value;
    },
    setKeyboardState(state: AppState, value: KeyboardState) {
        state.keyboardState = value;
    },
};

export const actions = {};
