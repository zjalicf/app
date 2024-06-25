<template>
    <div class="keybinds">
        <div class="keybinds--header">
            <div class="keybinds--header--title">Keybinds</div>
        </div>
        <div class="keybinds--caption">
            To customize a shortcut, click on the keybind you want to change and
            then press the keys you want to use for the new keybind.
        </div>
        <div class="divider" />
        <div class="keybinds--wrapper">
            <div
                v-for="namespace in customizables"
                :key="namespace.key"
                class="keybinds--wrapper--namespace"
            >
                <div class="keybinds--section--header">
                    {{ namespace.name }}
                </div>
                <div
                    v-for="[shortcut, { keybind }] in namespace.bindings"
                    :key="shortcut"
                    class="keybinds--section--items"
                    @click="changeShortcut(shortcut)"
                >
                    <div class="keybinds--section--items--name name">
                        {{ formatShortcut(shortcut) }}
                    </div>
                    <div
                        v-if="isRecording(shortcut)"
                        class="keybinds--section--items--recording"
                    >
                        Recording keybind
                    </div>
                    <div
                        v-else-if="!keybind"
                        class="keybinds--section--items--missing"
                    >
                        Keybind missing
                    </div>
                    <TooltipKeys
                        v-else-if="!isArray(keybind)"
                        :keybind="keybind"
                    />
                </div>
            </div>
        </div>
        <div class="divider"></div>
        <div class="keybinds--footer">
            <div class="keybinds--footer--import">
                <div class="keybinds--footer--import--input">
                    <label for="import-input">Import shortcuts</label>
                    <input
                        id="import-input"
                        v-model="importString"
                        placeholder="Paste import string here..."
                    />
                </div>
                <button
                    :disabled="importString.length === 0 || !isValidDataString"
                    @click="importShortcuts"
                >
                    Import
                </button>
            </div>
        </div>
        <div class="divider" />
        <div class="keybinds--actions">
            <button class="keybinds--header--defaults" @click="restoreDefaults">
                Restore Defaults
            </button>

            <button class="keybinds--header--defaults" @click="exportShortcuts">
                Export Shortcuts
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import isArray from 'lodash/isArray';
import TooltipKeys from '~/components/cheatsheet/TootipKeys.vue';
import { SHORTCUTS_ALIASES } from '~/plugins/shortcuts-manager/keybinds';
import CInput from '~/components/CInput.vue';
import CButton from '~/components/CButton.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'Preferences',
    components: { CButton, CInput, TooltipKeys },
})
export default class Preferences extends Vue {
    recordingShortcut: SHORTCUTS_ALIASES | null = null;
    importString = '';
    keyupListener: any = null;
    customizables = [
        {
            name: 'System shortcuts',
            bindings: this.getKeybindNamespace('system-shortcuts'),
        },
        {
            name: 'Navigation',
            bindings: this.getKeybindNamespace('navigation'),
        },
        {
            name: 'Entities',
            bindings: this.getKeybindNamespace('create'),
        },
        {
            name: 'Editor',
            bindings: this.getKeybindNamespace('core'),
        },
        {
            name: 'Calendar',
            bindings: this.getKeybindNamespace('calendar'),
        },
        {
            name: 'Tasks',
            bindings: this.getKeybindNamespace('tasks'),
        },
    ];

    get keybinds() {
        return this.$shortcutsManager.keybinds;
    }

    get isValidDataString() {
        return this.$shortcutsManager.validateCustomShortcutsString(
            this.importString,
        );
    }

    isRecording(shortcut: SHORTCUTS_ALIASES) {
        return this.recordingShortcut === shortcut;
    }

    @Watch('$shortcutsManager.keybinds')
    setCustomizables() {
        this.customizables = [
            {
                name: 'System shortcuts',
                bindings: this.getKeybindNamespace('system-shortcuts'),
            },
            {
                name: 'Navigation',
                bindings: this.getKeybindNamespace('navigation'),
            },
            {
                name: 'Entities',
                bindings: this.getKeybindNamespace('create'),
            },
            {
                name: 'Editor',
                bindings: this.getKeybindNamespace('core'),
            },
            {
                name: 'Calendar',
                bindings: this.getKeybindNamespace('calendar'),
            },
            {
                name: 'Tasks',
                bindings: this.getKeybindNamespace('tasks'),
            },
        ];
    }

    isArray(keys: string | string[]) {
        return isArray(keys);
    }

    formatShortcut(shortcut: string) {
        const name = shortcut.split(':').pop()!.trim();
        return this.titleCase(name);
    }

    getKeybindNamespace(namespace: string) {
        const keybinds = Object.entries(this.$shortcutsManager.keybinds).filter(
            ([_key, value]) =>
                value.category === namespace && value.configurable,
        );

        return keybinds;
    }

    titleCase(key: string): string {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    restoreDefaults() {
        this.$shortcutsManager.clearCustomShortcuts();

        this.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                displayText: 'Keybinds restored to default',
            },
        });

        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action: TrackingAction.RESTORE_DEFAULT_SHORTCUTS,
        });
    }

    changeShortcut(shortcut: SHORTCUTS_ALIASES) {
        if (this.$shortcutsManager.isRecording) {
            window.removeEventListener('keyup', this.keyupListener);
            this.$shortcutsManager.setRecording(false);
            this.recordingShortcut = null;
            return;
        }

        this.recordingShortcut = shortcut;
        this.$shortcutsManager.setRecording(true);

        this.keyupListener = (event: KeyboardEvent) => {
            const keySet = this.$shortcutsManager.parseKeySet(event, false);

            if (keySet.length < 2) {
                window.removeEventListener('keyup', this.keyupListener);
                const recording = this.$shortcutsManager.recording;
                this.$shortcutsManager.setRecording(false);
                this.recordingShortcut = null;
                const isValidShortcut =
                    recording.keySet.filter(
                        (key: string) =>
                            !['meta', 'ctrl', 'alt', 'shift', 'esc'].includes(
                                key,
                            ),
                    ).length > 0;
                if (!isValidShortcut) return;
                this.$shortcutsManager.setCustomKeybinds(shortcut, recording);
                this.$tracking.trackEventV2(TrackingType.SETTINGS, {
                    action: TrackingAction.CHANGE_KEYBIND,
                    // @ts-ignore
                    source: shortcut,
                    // @ts-ignore
                    sourceMeta: recording.keybind!,
                });
            }
        };
        window.addEventListener('keyup', this.keyupListener);
    }

    exportShortcuts() {
        const dataString = this.$shortcutsManager.exportCustomShortcuts();
        this.$utils.copyToClipboard(dataString);
        this.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                displayText: 'Keybind configuration copied to clipboard',
            },
        });

        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action: TrackingAction.EXPORT_SHORTCUTS,
        });
    }

    importShortcuts() {
        this.$shortcutsManager.importCustomShortcuts(this.importString);
        this.importString = '';
        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action: TrackingAction.IMPORT_SHORTCUTS,
        });
    }
}
</script>

<style lang="scss" scoped>
.divider {
    margin: 12px 12px;
    height: 1px;
    background: var(--tab-divider-color);
}

.keybinds {
    color: var(--settings-modal-title-color);
    user-select: none;
    cursor: default;
    padding: 30px 18px;

    &--caption {
        @include font12-500;
        padding: 0 12px;
        margin-top: 6px;
        cursor: default;
        color: var(--settings-modal-option-description-color);
    }

    &--header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;

        &--defaults {
            @include font12-500;
            border-radius: 6px;
            padding: 5px 12px;
            color: var(--settings-modal-button-primary-text-color);
            background: var(--settings-modal-button-primary-bg-color);
            outline: none;

            &:hover {
                color: var(--settings-modal-button-primary-text-color__hover);
                background: var(
                    --settings-modal-button-primary-bg-color__hover
                );
            }
        }

        &--title {
            @include font14-600;
            color: var(--settings-modal-title-color);
        }
    }

    &--footer {
        padding: 0 12px;

        &--import {
            width: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            margin-bottom: 20px;
            gap: 8px;

            input {
                @include inputMetaStyles;
                @include font12-500;
                padding: 5px 11px;
                background: var(--vault-settings-input-bg-color);
                width: 100%;
                color: var(--vault-settings-input-text-color);
                border-radius: 6px;
                outline: none;

                &::placeholder {
                    color: var(--vault-settings-input-placeholder-color);
                }
            }

            button {
                @include font12-500;
                border-radius: 6px;
                padding: 5px 12px;
                color: var(--settings-modal-button-primary-text-color);
                background: var(--settings-modal-button-primary-bg-color);
                outline: none;

                &:hover {
                    color: var(
                        --settings-modal-button-primary-text-color__hover
                    );
                    background: var(
                        --settings-modal-button-primary-bg-color__hover
                    );
                }

                &:disabled {
                    background: var(
                        --settings-modal-keybinds-button-bg-color__disabled
                    );
                    color: var(
                        --settings-modal-keybinds-button-text-color__disabled
                    );
                }
            }

            label {
                @include font12-500;
                color: var(--settings-modal-option-title-color);
                margin-bottom: 6px;
                display: block;
            }

            &--input {
                width: 100%;
            }
        }
    }

    &--wrapper {
        margin-top: 20px;

        &--namespace {
            width: 100%;
        }
    }

    &--section {
        &--header {
            @include font12-600;
            padding: 0 12px;
            color: var(--settings-modal-option-title-color);
            margin-bottom: 6px;
            margin-top: 12px;
        }

        &--items {
            width: 100%;
            padding: 6px 12px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            &:hover {
                background: var(--settings-modal-keybinds-bg-color__hover);

                .name {
                    color: var(--settings-modal-keybinds-text-color__hover);
                }
            }

            &--name {
                @include font12-500;
                color: var(--settings-modal-keybinds-text-color);
            }

            &--recording {
                @include font12-500;
                color: var(--settings-modal-keybinds-recording-text-color);
            }

            &--missing {
                @include font12-500;
                color: var(--settings-modal-keybinds-missing-text-color);
            }
        }
    }

    &--actions {
        padding: 0 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
}
</style>
