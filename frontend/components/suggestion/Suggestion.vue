<template>
    <div class="suggestion" :class="[active ? 'active' : null, size]">
        <div class="suggestion-wrapper">
            <div class="suggestion-title">
                <div v-if="icon" class="icon-wrapper">
                    <CheckIcon class="icon" size="20" />
                </div>
                <p class="suggestion-title--text">{{ suggestionText }}</p>
                <p v-if="labels.length" class="suggestion-title--new-label">
                    {{ labels.join(' ') }}
                </p>
            </div>
            <div v-if="date" class="suggestion-time suggestion-extra">
                <p>
                    {{ dateString }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { CheckIcon } from '@vue-hero-icons/outline';
import { formatRelativeToDate } from '~/helpers';
import { labelRegexp } from '~/constants/regexp';

@Component({
    components: {
        CheckIcon,
    },
})
export default class Suggestion extends Vue {
    @Prop({ default: '' })
    text!: string;

    @Prop({ default: false })
    active!: boolean;

    @Prop({ default: '' })
    labels!: string[];

    @Prop({ default: '' })
    date!: any;

    @Prop({ default: '' })
    size!: string;

    @Prop({ default: true })
    icon!: boolean;

    get suggestionText() {
        // if (this.date && this.labels.length > 0) {
        //     return this.text + ' #' + this.labels.join(' #');
        // } else {
        //     return this.text;
        // }
        return this.text.replace(labelRegexp, '');
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
    margin: 8px 1px 0px;
    border: 2px solid rgba(0, 0, 0, 0);
    border-radius: 6px;
    cursor: default;

    &.active {
        margin: 8px 1px 0px;
        border: 2px solid var(--accent-color);
        background: var(--suggestion-bg-color__active);
    }

    .suggestion-wrapper {
        padding-bottom: 4px;

        .suggestion-title {
            display: flex;
            align-items: flex-end;

            .icon-wrapper {
                padding-left: 7px;
                padding-right: 1px;
            }

            &--text {
                color: var(--suggestion-text-color);
                padding: 4px 0px 0px 11px;
            }

            &--new-label {
                font-weight: 500;
                color: var(--suggestion-label-color);
            }

            p {
                @include ellipsis;
                font-weight: 500;
                font-size: 15px;
                line-height: 1.552;
                padding-left: 10px;
            }
        }

        .suggestion-extra {
            font-weight: 500;
            font-size: 15px;
            color: var(--suggestion-extra-color);
            padding-left: 24px;
        }

        .suggestion-time {
            margin-bottom: -4px;
        }
    }

    &.virtual-task-adder {
        .suggestion-title {
            .suggestion-title--text {
                padding-left: 26px;
                font-size: 13px;
            }

            .suggestion-title--new-label {
                padding-left: 4px;
                padding-right: 0px;
                font-size: 13px;
            }
        }

        .suggestion-time {
            padding-left: 0px;

            p {
                padding-left: 26px;
                font-size: 13px;
            }
        }
    }

    &.small {
        .suggestion-title {
            .suggestion-title--text {
                padding-left: 10px;
                font-size: 13px;
            }

            .suggestion-title--new-label {
                padding-left: 4px;
                padding-right: 0px;
                font-size: 13px;
            }
        }

        .suggestion-time {
            padding-left: 0px;

            p {
                padding-left: 10px;
                font-size: 13px;
            }
        }
    }

    &.large {
        margin: 0px 0px 0px;
        border: 2px solid rgba(0, 0, 0, 0);
        border-radius: 6px;
        cursor: default;

        &.active {
            margin: 0px 0px 0px;
            border: 2px solid var(--accent-color);
            background: var(--suggestion-bg-color__active);
        }

        .suggestion-title {
            .suggestion-title--text {
                padding-left: 10px;
                font-size: 13px;
            }

            .suggestion-title--new-label {
                padding-left: 4px;
                padding-right: 0px;
                font-size: 13px;
            }
        }

        .suggestion-time {
            padding-left: 0px;

            p {
                padding-left: 38px;
                font-size: 13px;
            }
        }
    }

    &.medium {
        padding-bottom: 3px;

        .suggestion-title {
            .suggestion-title--text {
                padding-left: 33px;
                font-size: 13px;
            }

            .suggestion-title--new-label {
                padding-left: 4px;
                font-size: 13px;
            }
        }

        .suggestion-time {
            padding-left: 0px;

            p {
                padding-left: 33px;
                font-size: 13px;
            }
        }
    }

    &.tiny {
        margin: 0;

        &.active {
            margin: 0;
        }

        .suggestion-title {
            p {
                padding-left: 4px;
                font-size: 13px;
            }
        }

        .suggestion-time {
            padding-left: 0px;

            p {
                padding-left: 4px;
                font-size: 13px;
            }
        }
    }
}
</style>
