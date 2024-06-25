<template>
    <div ref="result" class="suggestion">
        <div class="suggestion-wrapper">
            <div
                v-if="vaultId === $store.getters['vault/active'].id"
                class="active-vault-result--title"
            >
                <div class="icon-wrapper">
                    <DocumentIcon
                        v-if="type === 'document'"
                        class="icon"
                        size="20"
                    />
                    <CheckIcon v-if="type === 'task'" class="icon" size="20" />
                    <LightBulbIcon
                        v-if="type === 'suggestions'"
                        class="icon"
                        size="20"
                    />
                </div>
                <p>{{ text }}</p>
            </div>
            <div v-else class="other-vault-result">
                <div class="other-vault-result--title">
                    <div class="icon-wrapper">
                        <DocumentIcon
                            v-if="type === 'document'"
                            class="icon"
                            size="20"
                        />
                        <CheckIcon
                            v-if="type === 'task'"
                            class="icon"
                            size="20"
                        />
                        <LightBulbIcon
                            v-if="type === 'suggestions'"
                            class="icon"
                            size="20"
                        />
                    </div>
                </div>
                <div class="other-vault-result--vault">
                    <p>{{ text }}</p>
                    <div class="other-vault-result--vault--dot"></div>
                    <div class="other-vault-result--vault--name">
                        {{ vault.name.toUpperCase() }}
                    </div>
                </div>
            </div>

            <div v-if="date" class="suggestion-time suggestion-extra">
                <p>
                    {{ dateString }}
                </p>
            </div>
            <div v-if="labels" class="suggestion-label suggestion-extra">
                <p>{{ labels.join(', ') }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { DocumentIcon, CheckIcon, LightBulbIcon } from '@vue-hero-icons/solid';
import { formatRelativeToDate } from '~/helpers';

@Component({
    name: 'MobileSearchResult',
    components: {
        DocumentIcon,
        CheckIcon,
        LightBulbIcon,
    },
})
export default class MobileSearchResult extends Vue {
    $refs!: {
        result: HTMLElement;
    };

    @Prop({ default: 'document' })
    type!: string;

    @Prop({ default: '' })
    text!: string;

    @Prop({ default: '' })
    labels!: string;

    @Prop({ default: '' })
    date!: any;

    @Prop({ default: '' })
    vaultId!: string;

    @Prop({ default: false })
    isActiveVault!: boolean;

    get vault() {
        return this.$store.getters['vault/byId'](this.vaultId) || { name: '' };
    }

    get dateString() {
        const now = new Date();
        return formatRelativeToDate(
            this.date,
            now,
            true,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }
}
</script>

<style scoped lang="scss">
.suggestion {
    @include paneButtons;
    padding: 16px 0 0 16px;

    .suggestion-wrapper {
        .other-vault-result,
        .active-vault-result {
            &--title {
                display: flex;
                align-items: center;

                .icon-wrapper {
                    display: flex;
                    align-items: center;
                    margin-right: 16px;
                    padding-bottom: 16px;

                    .icon {
                        color: $blueGrey300;
                    }
                }

                p {
                    @include ellipsis;
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 19px;
                    letter-spacing: -0.24px;
                    color: #ffffff;
                    width: 100%;
                    padding-bottom: 16px;
                }
            }
        }

        .other-vault-result {
            display: flex;
            align-items: center;

            &--title {
                white-space: nowrap;
            }

            &--vault {
                width: 100%;
                white-space: nowrap;
                display: flex;
                align-items: center;
                padding-bottom: 16px;

                p {
                    @include ellipsis;
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 19px;
                    letter-spacing: -0.24px;
                    color: #ffffff;
                    margin-right: 8px;
                }

                &--dot {
                    background-color: $blueGrey400;
                    width: 4px;
                    height: 4px;
                    border-radius: 2px;
                    margin-right: 8px;
                    margin-left: 4px;
                    min-width: 4px;
                }

                &--name {
                    @include ellipsis;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 17px;
                    letter-spacing: -0.24px;
                    color: $blueGrey400;
                    padding-right: 4px;
                }
            }
        }

        .suggestion-extra {
            font-weight: 500;
            font-size: 15px;
            color: #949dad;
            padding-left: 20px;
        }
    }
}
</style>
