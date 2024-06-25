import { Context } from '@nuxt/types';
import { KeyboardState } from '~/constants/mobile';

export class MobileUtils {
    private context: Context;
    private keyboardStateCallbacks: {
        [key: string]: [() => void];
    };

    constructor(ctx: Context) {
        this.context = ctx;
        this.keyboardStateCallbacks = Object.values(KeyboardState).reduce(
            (acc, key) => {
                acc[key] = [];
                return acc;
            },
            {} as any,
        );
    }

    changeKeyboardState(state: KeyboardState) {
        this.context.store.commit('mobile/setKeyboardState', state);
        this.onKeyboardStateChange(state);
    }

    async _closeKeyboard() {
        const { Keyboard } = await import('@capacitor/keyboard');
        await Keyboard.hide();
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 150);
        });
    }

    async closeKeyboard() {
        return new Promise<void>(resolve => {
            const currentState =
                this.context.store.getters['mobile/keyboardState'];
            switch (currentState) {
                case KeyboardState.DID_SHOW:
                    this._closeKeyboard().then(() => {
                        resolve();
                    });
                    break;
                case KeyboardState.WILL_SHOW:
                    this.keyboardStateCallbacks[KeyboardState.DID_SHOW].push(
                        async () => {
                            await this._closeKeyboard().then(() => {
                                resolve();
                            });
                        },
                    );
                    break;
                default:
                    resolve();
            }
        });
    }

    private async onKeyboardStateChange(state: KeyboardState) {
        if (this.keyboardStateCallbacks[state]?.length > 0) {
            await Promise.all(
                this.keyboardStateCallbacks[state].map(async cb => await cb()),
            );
            this.keyboardStateCallbacks[state] = [] as any;
        }
    }

    get keyboardWillOpen() {
        return (
            this.context.store.getters['mobile/keyboardState'] ===
            KeyboardState.WILL_SHOW
        );
    }

    get keyboardDidOpen() {
        return (
            this.context.store.getters['mobile/keyboardState'] ===
            KeyboardState.DID_SHOW
        );
    }

    get keyboardOpen() {
        return this.keyboardWillOpen || this.keyboardDidOpen;
    }
}
