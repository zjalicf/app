<template>
    <div class="assistant-preferences">
        <div class="assistant-preferences__title">
            Assistant <span>BETA</span>
        </div>
        <div class="assistant-preferences__caption">
            The assistant features are currently in the beta version which uses
            OpenAI's API. Their usage is therefore subject to the following
            <a
                href="https://openai.com/policies/api-data-usage-policies"
                target="_blank"
                >privacy policy</a
            >
        </div>
        <div class="assistant-preferences__wrapper">
            <label
                class="assistant-preferences__wrapper__assistant"
                for="assistantEnabled"
            >
                <div class="assistant-preferences__wrapper__assistant__title">
                    <div>Enable acreom Assistant</div>
                    <div
                        class="
                            assistant-preferences__wrapper__assistant__description
                        "
                    >
                        <p>
                            acreom Assistant lets you query your knowledge base
                            using natural language, generate mermaid charts from
                            text, and summarize long content.
                            <a
                                href="https://acreom.com/docs/assistant"
                                target="_blank"
                                >Learn more</a
                            >
                        </p>
                    </div>
                </div>
                <div class="assistant-preferences__wrapper__assistant__toggle">
                    <CSwitch
                        id="assistantEnabled"
                        :value="assistantEnabled"
                        @input="updateEnableAssistant"
                    />
                </div>
            </label>
        </div>
        <div
            v-if="assistantEnabled && activeModel"
            class="assistant-preferences__active-models"
        >
            <div class="assistant-preferences__active-models__model">
                <div
                    class="assistant-preferences__active-models__model__header"
                >
                    {{ activeModelText }}
                </div>
                <div
                    class="assistant-preferences__active-models__model__actions"
                >
                    <span v-if="!hasCustomToken">
                        Usage Today: {{ assistantUsage }} / 25
                    </span>
                    <button v-else @click="revertToDefaultIntegration">
                        <InterfaceDelete1 size="12" class="icon" />
                    </button>
                </div>
            </div>
        </div>
        <button
            v-if="assistantEnabled && !hasCustomToken"
            class="assistant-preferences__custom-token-button"
            @click="openCustomTokenModal"
        >
            Add Your OpenAI API Key
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CSwitch from '~/components/CSwitch.vue';
import { EditorNarrowIcon, EditorWideIcon } from '~/components/icons';
import CIconSwitch from '~/components/CIconSwitch.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import ASelect from '~/components/ASelect.vue';
import ChatGPTTokenModal from '~/components/assistant/ChatGPTTokenModal.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'AssistantSettings',
    components: {
        InterfaceDelete1,
        CSwitch,
        EditorNarrowIcon,
        EditorWideIcon,
        CIconSwitch,
        DropdownButton,
        ASelect,
    },
})
export default class AssistantSettings extends Vue {
    $refs!: {
        modelPickerButton: HTMLButtonElement;
    };

    get availableIntegrations() {
        return this.$entities.assistant.list();
    }

    get activeModelText() {
        if (!this.activeModel) return 'Assistant not enabled';
        if (this.activeModel.type === 'default') return 'Using ChatGPT';
        if (this.activeModel.type === 'custom')
            return 'Using custom OpenAI API Key';
    }

    get assistantUsage() {
        return this.$utils.assistant.usage;
    }

    get assistantEnabled() {
        return this.$store.getters['vaultSettings/assistantOptions']
            .assistantEnabled;
    }

    get activeModel() {
        const integrations = this.availableIntegrations;
        return integrations.find((i: any) => i.data.isActive)?.data ?? null;
    }

    get hasCustomToken() {
        return (
            this.availableIntegrations.find(
                (i: any) => i.data?.type === 'custom',
            ) !== undefined
        );
    }

    @TrackEvent(TrackingType.ASSISTANT, {
        action: TrackingAction.DISABLE,
    })
    clearAssistantIntegrations() {
        if (!this.availableIntegrations.length) return;
        return this.$entities.assistant.delete(this.availableIntegrations[0]);
    }

    @TrackEvent(TrackingType.ASSISTANT, {
        action: TrackingAction.ENABLE,
    })
    async setupRemoteModel() {
        const integration = this.$entities.assistant.createIntegration({
            type: 'default',
            isActive: true,
        });
        await this.$entities.assistant.saveToStore(integration);
    }

    updateEnableAssistant(value: boolean) {
        if (value) {
            this.setupRemoteModel();
        } else {
            this.clearAssistantIntegrations();
        }
        this.$store.dispatch('vaultSettings/updateAssistantOptions', {
            assistantEnabled: value,
        });
    }

    @TrackEvent(TrackingType.ASSISTANT, {
        action: TrackingAction.REMOVE_API_KEY,
    })
    async revertToDefaultIntegration() {
        await this.$entities.assistant.updateIntegration({
            type: 'default',
            isActive: true,
        });
    }

    @TrackEvent(TrackingType.ASSISTANT, {
        action: TrackingAction.ADD_API_KEY,
    })
    async onCustomTokenAdded(token: string) {
        try {
            await this.$entities.assistant.updateIntegration({
                type: 'custom',
                apiKey: token,
                isActive: true,
            });
            this.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: 'OpenAI API key added.',
                },
            });
        } catch (e) {
            console.log(e);
            this.$notification.show({
                component: () =>
                    import('@/components/notifications/ErrorNotification.vue'),
                bind: {
                    displayText: 'Error adding OpenAI API key.',
                },
            });
        }
    }

    openCustomTokenModal() {
        this.$vfm.show({
            component: ChatGPTTokenModal,
            on: {
                save: async (token: string) => {
                    await this.onCustomTokenAdded(token);
                },
            },
        });
    }
}
</script>

<style lang="scss" scoped>
.assistant-preferences {
    color: $blueGrey50;
    user-select: none;
    cursor: default;
    font-weight: 500;
    font-size: 15px;
    padding: 30px;

    &__active-models {
        background: var(--settings-modal-notifications-bg-color);
        padding: 12px 12px 12px 16px;
        border-radius: 12px;
        margin-top: 20px;

        &__model {
            @include font12-500;
            color: var(--settings-modal-title-color);
            padding: 6px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            &__header {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            &__actions {
                display: flex;
                align-items: center;
                gap: 6px;

                button {
                    padding: 6px;
                    color: var(--settings-modal-calendar-remove-button-color);

                    &:hover {
                        color: var(
                            --settings-modal-calendar-remove-button-color__hover
                        );
                    }
                }
            }
        }
    }

    &__custom-token-button {
        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
        border-radius: 6px;
        padding: 5px 11px;
        font-weight: 600;
        font-size: 13px;
        line-height: 20px;
        color: var(--settings-modal-button-primary-text-color);
        background: var(--settings-modal-button-primary-bg-color);
        outline: none;
        position: relative;
        margin-top: 20px;

        &:hover {
            background: var(--settings-modal-button-primary-bg-color__hover);
            color: var(--settings-modal-button-primary-text-color__hover);
        }
    }

    &__caption {
        @include font12-500;
        color: var(--settings-modal-option-description-color);
        margin-top: 6px;
        cursor: default;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--tab-divider-color);
        margin-bottom: 20px;
    }

    a {
        color: var(--accent-color);
        text-decoration: underline;
    }

    &__title {
        @include font14-600;
        color: var(--settings-modal-title-color);
        display: flex;
        align-items: center;
        gap: 6px;

        span {
            @include proBadge;
        }
    }

    &__wrapper {
        &__assistant {
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;

            &__title {
                @include font12-600;
                color: var(--settings-modal-title-color);
            }

            &__description {
                @include font12-500;
                color: var(--settings-modal-option-description-color);
                margin-top: 4px;
            }
        }
    }
}
</style>
