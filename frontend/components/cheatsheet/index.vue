<template>
    <transition name="fade" @enter="openInner" @after-leave="innerOpen = false">
        <div v-if="show" class="cheatsheet-wrapper">
            <div
                v-shortkey="shortkeyOptions"
                class="backdrop"
                @click="$store.commit('closeCheatsheet')"
                @shortkey="shortkeyHandler"
            ></div>
            <transition name="slide-fade">
                <div v-if="innerOpen" class="cheatsheet">
                    <div class="cheatsheet--header">
                        <button class="close-button" @click="closeCheatSheet">
                            <XIcon size="20" class="icon" />
                        </button>
                    </div>
                    <div class="content--table">
                        <div
                            v-for="(column, index) in columns"
                            :key="index"
                            class="content--table--col"
                        >
                            <div
                                v-for="namespace in column.namespaces"
                                :key="namespace.key"
                                class="content--table--col--section"
                            >
                                <div class="content--table--col--section--list">
                                    <div
                                        class="
                                            content--table--col--section--list--item
                                        "
                                    >
                                        <div></div>
                                        <h3
                                            class="
                                                content--table--col--section--header
                                            "
                                        >
                                            {{ namespace.name }}
                                        </h3>
                                    </div>
                                    <div
                                        v-for="[
                                            shortcut,
                                            { keybind },
                                        ] in getKeybindNamespace(namespace.key)"
                                        :key="shortcut"
                                        class="
                                            content--table--col--section--list--item
                                        "
                                    >
                                        <TooltipKeys
                                            v-if="!isArray(keybind)"
                                            :keybind="keybind"
                                        />
                                        <div v-else class="shortcut-list">
                                            <div
                                                v-for="(keys, index) in keybind"
                                                :key="index"
                                                class="key-item"
                                            >
                                                <TooltipKeys :keybind="keys" />
                                                <span
                                                    v-if="
                                                        index + 1 <
                                                        keybind.length
                                                    "
                                                    >/</span
                                                >
                                            </div>
                                        </div>
                                        <div>
                                            {{
                                                shortcut
                                                    .split(':')
                                                    .pop()
                                                    .split(' ')
                                                    .map(titleCase)
                                                    .join(' ')
                                            }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="cheatsheet--footer">
                        <button class="custom-button" @click="customize">
                            Customize shortcuts
                        </button>
                    </div>
                </div>
            </transition>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import isArray from 'lodash/isArray';
import { XIcon } from '@vue-hero-icons/solid';
import TooltipKeys from '~/components/cheatsheet/TootipKeys.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'Cheatsheet',
    components: { TooltipKeys, XIcon },
})
export default class Cheatsheet extends Vue {
    @Prop()
    show!: boolean;

    innerOpen: boolean = false;

    columns = [
        {
            namespaces: [
                { name: 'System shortcuts', key: 'system-shortcuts' },
                { name: 'Navigation', key: 'navigation' },
                { name: 'Entities', key: 'create' },
                { name: 'Page Tab', key: 'core' },
                { name: 'My Day Tab', key: 'navigation-my-day' },
                { name: 'Convert Editor Selection', key: 'convert-to' },
            ],
        },
        {
            namespaces: [
                { name: 'Tabs', key: 'tabs' },
                { name: 'Tasks', key: 'tasks' },
            ],
        },
    ];

    @Watch('$vfm.openedModals')
    handleVFMOpened(value: any[]) {
        if (value.length > 0) {
            this.closeCheatSheet();
        }
    }

    get shortkeyOptions() {
        if (!this.$store.getters.cheatsheetOpen) {
            return null;
        }
        return { blur: ['esc'] };
    }

    closeCheatSheet() {
        if (!this.$store.getters.cheatsheetOpen) return;
        this.$store.commit('closeCheatsheet');
    }

    shortkeyHandler(event: any) {
        switch (event.srcKey) {
            case 'blur':
                this.closeCheatSheet();
                break;
        }
    }

    isArray(keys: string | string[]) {
        return isArray(keys);
    }

    openInner() {
        this.innerOpen = true;
    }

    getKeybindNamespace(namespace: string) {
        const keybinds = Object.entries(this.$shortcutsManager.keybinds).filter(
            ([_key, value]) =>
                (!value.notAllowed ||
                    (!value.notAllowed.includes(this.$config.platform) &&
                        !value.notAllowed.includes(this.$config.os))) &&
                value.category === namespace,
        );

        if (namespace === 'core') {
            keybinds.unshift(['Unfocus Editor', { keybind: 'Escape' }]);
            keybinds.unshift(['Focus Editor', { keybind: 'Enter' }]);
        }

        return keybinds;
    }

    titleCase(key: string): string {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    customize() {
        this.$utils.navigation.openSettings(
            'keybinds',
            TrackingActionSource.KEYBOARD_SHORTCUTS,
        );
    }
}
</script>

<style lang="scss" scoped>
.cheatsheet-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: var(--viewport-height);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    user-select: none;
    cursor: default;

    .backdrop {
        background: var(--cheat-sheet-backdrop-color);
        opacity: 0.4;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: var(--viewport-height);
    }
}

.shortcut-list {
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    justify-content: flex-end;
}

.cheatsheet {
    @include scrollbar(10px, 40px);
    @include modal;
    position: fixed;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.06),
        inset 0px 0px 0px 1px rgba(241, 241, 241, 0.02);
    max-width: 90vw;
    max-height: 90vh;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow-y: overlay;
    @media (max-width: 904px) {
        width: 100%;
    }

    &--header {
        position: sticky;
        top: 0;
        left: 0;

        button {
            position: absolute;
            top: 16px;
            left: 16px;
            outline: none;
            color: var(--cheat-sheet-button-color);

            &:hover {
                color: var(--cheat-sheet-button-color__hover);
            }
        }
    }

    &--footer {
        position: sticky;
        bottom: 0;
        right: 0;
        padding: 8px 16px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
        backdrop-filter: blur(12px); /* Chrome and Opera */
        background: var(--cheat-sheet-footer-bg-color);
        border-top: 1px solid var(--tab-divider-color);

        button {
            outline: none;
            color: var(--cheat-sheet-button-color);

            &:hover {
                color: var(--cheat-sheet-button-color__hover);
            }
        }
    }

    .content--table {
        @include scrollbar;
        display: grid;
        grid-template-columns: minmax(382px, 1fr) minmax(382px, 1fr);
        justify-items: stretch;
        overflow-y: auto;
        padding: 24px 32px;
        color: var(--cheat-sheet-text-color);

        @media (max-width: 904px) {
            display: block;
            width: 100%;
        }

        &--col {
            padding-right: 16px;

            &:nth-of-type(odd) {
                border-right: 1px solid var(--tab-divider-color);
            }

            &--section {
                &:not(:last-of-type) {
                    margin-bottom: 32px;
                }

                &--header {
                    font-size: 13px;
                    font-weight: 700;
                    line-height: 155.2%;
                }

                &--list {
                    &--item {
                        display: grid;
                        grid-template-columns: minmax(110px, 1fr) minmax(
                                110px,
                                1fr
                            );
                        gap: 0 12px;
                        justify-items: stretch;

                        &:not(:last-of-type) {
                            margin-bottom: 6px;
                        }

                        > :nth-child(2) {
                            font-size: 13px;
                            line-height: 155.2%;
                        }

                        > :nth-child(1) {
                            font-weight: 500;
                            font-size: 13px;
                            line-height: 155.2%;
                            color: var(--cheat-sheet-list-item-color);
                        }
                    }
                }
            }
        }
    }
}

.key-item {
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    justify-content: flex-end;

    span {
        padding: 0 2px;
        align-content: center;
        font-size: 17px;
        font-weight: 500;
    }
}
</style>
