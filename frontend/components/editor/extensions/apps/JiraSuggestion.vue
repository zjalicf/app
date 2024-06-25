<template>
    <div
        class="suggestion"
        :class="{ active, small, redirect: isNew && isTemplate }"
    >
        <div class="suggestion-wrapper">
            <div class="suggestion-title">
                <div class="icon-wrapper">
                    <IssueType :entity="entity" class="icon" />
                </div>
                <p>{{ text }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import {
    DocumentAddIcon,
    ColorSwatchIcon,
    CogIcon,
} from '@vue-hero-icons/solid';
import { formatRelativeToDate } from '~/helpers';
import { IDocument } from '~/components/document/model';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceFileAddAlt from '~/components/streamline/InterfaceFileAddAlt.vue';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import IssueType from '~/components/integrations/jira/issue/IssueType.vue';

@Component({
    components: {
        IssueType,
        JiraIcon,
        InterfaceFavoriteStar,
        InterfaceFileAddAlt,
        DocumentIcon,
        DocumentAddIcon,
        ColorSwatchIcon,
        CogIcon,
    },
})
export default class JiraSuggestion extends Vue {
    @Prop({ default: '' })
    text!: string;

    @Prop({ default: '' })
    entityId!: string;

    @Prop({ default: false })
    active!: boolean;

    @Prop({ default: '' })
    labels!: string;

    @Prop({ default: '' })
    date!: any;

    @Prop({ default: false })
    isNew!: boolean;

    @Prop({ default: false })
    isTemplate!: boolean;

    @Prop({ default: false })
    isDailyDoc!: boolean;

    @Prop({ default: false })
    small!: boolean;

    @Prop({ default: null })
    document!: IDocument;

    get entity() {
        return this.$store.getters['integrationData/byId'](this.entityId) ?? {};
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
    margin: 8px 7px 0px;
    border: 2px solid rgba(0, 0, 0, 0);
    border-radius: 6px;
    color: var(--editor-extension-jira-suggestion-text-color);

    &.active {
        margin: 8px 7px 0px;
        border: 2px solid var(--accent-color);
        background: var(--editor-extension-jira-suggestion-bg-color__active);
        color: var(--editor-extension-jira-suggestion-text-color__active);
    }

    .suggestion-wrapper {
        .suggestion-title {
            display: flex;
            align-items: center;

            .icon-wrapper {
                display: flex;
                align-items: center;
                padding-left: 4px;
                flex-shrink: 0;
            }

            p {
                @include ellipsis;
                white-space: pre;
                padding: 4px 13px 4px 12px;
                font-weight: 500;
                font-size: 15px;
                line-height: 1.552;
                cursor: default;
            }
        }
    }

    &.small {
        padding: 6px 10px;
        border-radius: 6px;
        color: var(--editor-extension-jira-suggestion-text-color);
        border: 0;
        margin: 0;

        &.active {
            padding: 4px 8px;
            border: 2px solid var(--accent-color);
            background: var(
                --editor-extension-jira-suggestion-bg-color__active
            );
            color: var(--editor-extension-jira-suggestion-text-color__active);
            margin: 0;

            .suggestion-wrapper .suggestion-title {
                p {
                    color: var(
                        --editor-extension-jira-suggestion-text-color__active
                    );
                }

                .icon-wrapper .icon {
                    color: var(
                        --editor-extension-jira-suggestion-text-color__active
                    );
                }
            }
        }

        &.redirect {
            padding: 6px 2px;

            &.active {
                padding: 4px 0;
            }
        }

        .suggestion-wrapper {
            .suggestion-title {
                display: flex;
                align-items: center;

                .icon-wrapper {
                    display: flex;
                    align-items: center;
                    padding-left: 0;
                    margin-right: 8px;

                    .icon {
                        color: var(
                            --editor-extension-jira-suggestion-icon-color
                        );
                    }
                }

                p {
                    @include font12-500;
                    @include ellipsis;
                    white-space: pre;
                    padding: 0;
                    color: var(
                        --editor-extension-jira-suggestion-title-text-color
                    );
                }
            }
        }
    }
}
</style>
