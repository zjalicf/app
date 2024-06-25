<template>
    <div
        v-longpress.prevent.hapticend="openContextMenu"
        class="doc-link no-select"
        @click="openPage"
    >
        <div class="document-card">
            <div class="document-card--title">
                <div class="document-card--title--main">
                    <h1 v-if="document.title">
                        <div class="document-icon-wrapper">
                            <DocumentIcon
                                :document="document"
                                size="14"
                                icon-size="22"
                                font-size="14"
                                class="document-icon"
                            />
                        </div>
                        <div class="document-card--title--wrapper">
                            {{ document.title }}
                        </div>
                    </h1>
                    <h1 v-else-if="document.template" class="untitled">
                        Untitled template
                    </h1>
                    <h1 v-else class="untitled">
                        <div class="document-icon-wrapper">
                            <DocumentIcon
                                :document="document"
                                size="14"
                                icon-size="22"
                                font-size="14"
                                class="document-icon"
                            />
                        </div>
                        Untitled
                    </h1>
                </div>
                <p v-if="!document.dailyDoc">
                    {{ lastUpdated | capitalize }}
                    {{ document.sharingUuid ? '• Public' : null }}
                </p>
                <p v-else>
                    <InterfaceFavoriteStar size="16" class="icon" />
                    My Day
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import RuntimeTemplate from '~/components/util/RuntimeTemplate.vue';
import { localizedRelativeFormat } from '~/helpers/date';
import InterfaceContentArchive from '~/components/streamline/InterfaceContentArchive.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import PageDropdown from '~/components/mobile/common/dropdown/PageDropdown.vue';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';

@Component({
    components: {
        InterfaceFavoriteStar,
        InterfaceContentArchive,
        DocumentIcon,
        RuntimeTemplate,
    },
    filters: {
        capitalize(value: string) {
            if (!value) return '';
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
    },
})
export default class DocumentCard extends Vue {
    @Prop()
    document!: any;

    @Prop({
        default: null,
    })
    level!: number | null;

    now: Date = new Date();

    openContextMenu() {
        setTimeout(() => {
            this.$pane.show({
                component: PageDropdown,
                bind: {
                    document: this.document,
                },
                type: 'dropdown',
            });
        }, 150);
    }

    openPage() {
        this.$router.push({
            path: `/mobile/documents/${this.document.id}`,
            query: {
                level: `${this.level}`,
            },
        });
    }

    get lastUpdated() {
        return localizedRelativeFormat(
            new Date(this.document.updatedAt),
            this.now,
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        );
    }
}
</script>
<style lang="scss" scoped>
.time-remain {
    position: absolute;
    bottom: 25px;
}

.document-link {
    text-decoration: none !important;
}
</style>
<style lang="scss" scoped>
.no-select {
    user-select: none;
}

.doc-link {
    cursor: default;
    text-decoration: none !important;
}

.document-card {
    @include animateBackgroundColor;
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    border: 1px solid var(--document-card-border-color);
    position: relative;
    border-radius: 8px;
    background: var(--document-card-bg-color);
    padding: 8px;

    &:active {
        background: var(--document-card-bg-color_hover);
        box-shadow: var(--document-card-box-shadow__hover);
        text-decoration: none !important;

        .document-card--title h1 {
            color: var(--document-card-title-text-color__hover);
        }
    }

    &--title {
        &--wrapper {
            @include ellipsis;
        }

        &--main {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        h1 {
            .document-icon-wrapper {
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 22px;
                margin-right: 4px;
            }

            @include ellipsis;
            font-weight: 500 !important;
            font-size: 15px !important;
            line-height: 23px !important;
            color: var(--document-card-title-text-color);
            padding: 0 !important;
            display: flex;

            .document-icon {
                flex-shrink: 0;
                align-items: center;
            }

            &.untitled {
                color: var(--document-card-untitled-text-color);
            }
        }

        p {
            padding: 0 4px;
            display: flex;
            align-items: center;
            font-weight: 500 !important;
            font-size: 11px !important;
            line-height: 17px !important;
            color: var(--document-card-meta-text-color) !important;

            .icon {
                margin-right: 2px;
                margin-left: -2px;
            }
        }
    }
}
</style>
