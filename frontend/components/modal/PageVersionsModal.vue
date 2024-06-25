<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="page-versions-container"
        content-class="page-versions-content"
        overlay-transition="fade"
        :esc-to-close="true"
        :click-to-close="true"
        :content-style="{
            maxWidth: '95vw',
            width: '100%',
            maxHeight: '95vh',
            height: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
        @closed="trackClose"
    >
        <div v-if="pageVersions.length" class="page-versions">
            <div class="page-versions__content">
                <div class="page-versions__content__date">
                    {{
                        isLatest
                            ? 'Current Version'
                            : formatDate(pageVersion.createdAt)
                    }}
                    <CButton
                        v-if="!isLatest"
                        type="primary"
                        @click="restoreVersion(close)"
                        >Restore this version</CButton
                    >
                </div>
                <div class="page-versions__content__wrapper">
                    <div class="page-versions__content__title">
                        {{ versionTitle }}
                    </div>
                    <EditorComponent
                        class="page-versions__content__editor"
                        :value="versionContent"
                        :editable="false"
                    />
                </div>
            </div>
            <div class="page-versions__list">
                <div class="page-versions__list__header">Version History</div>
                <div class="page-versions__list__versions">
                    <button
                        v-for="(version, index) in pageVersions"
                        :key="version.id"
                        class="page-versions__list__versions__version"
                        :class="{
                            selected: version.id === selectedVersionId,
                        }"
                        @click="selectVersion(version.id)"
                    >
                        {{
                            index === 0
                                ? 'Current Version'
                                : formatDate(version.createdAt)
                        }}
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="page-versions">
            <div class="page-versions__empty">
                <div class="page-versions__empty__text">
                    No versions available
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, ProvideReactive, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import CButton from '~/components/CButton.vue';
import EditorComponent from '~/components/editor/EditorComponent.vue';
import CSwitch from '~/components/CSwitch.vue';
import { IVersion } from '~/@types/app';
import { TabSymbols } from '~/constants/symbols';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'PageVersionsModal',
    components: { CSwitch, EditorComponent, CButton },
})
export default class PageVersionsModal extends Vue {
    @Prop()
    id!: string;

    @ProvideReactive(TabSymbols.TAB_ID)
    get active() {
        return true;
    }

    selectedVersionId: string = '';
    pageVersions: IVersion[] = [];

    get isLatest() {
        if (!this.pageVersion || !this.pageVersions.length) return false;
        const first = this.pageVersions[0];
        return this.pageVersion.id === first.id;
    }

    get versionTitle() {
        if (!this.pageVersion) {
            return '';
        }
        return this.pageVersion.content.title;
    }

    get pageVersion() {
        return this.pageVersions.find(
            version => version.id === this.selectedVersionId,
        );
    }

    get versionContent() {
        if (!this.pageVersion) {
            return '';
        }
        return this.pageVersion.content.content;
    }

    trackClose() {
        this.$tracking.trackEventV2(TrackingType.VERSION_HISTORY, {
            action: TrackingAction.CLOSE,
            entityId: this.id,
        });
    }

    selectVersion(id: string) {
        this.selectedVersionId = id;
    }

    async beforeMount() {
        const currentPage = await this.$entities.page.byId(this.id);
        const versions = await this.$entities.version.getVersions(this.id);

        if (currentPage) {
            const currentVersion: IVersion = {
                id: v4(),
                entityId: currentPage.id,
                entityType: 'document',
                createdAt: currentPage.updatedAt,
                updatedAt: currentPage.updatedAt,
                clientId: v4(),
                vaultId: currentPage.vaultId,
                content: {
                    content: currentPage.content,
                    title: currentPage.title,
                    pageStatus: currentPage.pageStatus,
                    icon: currentPage.icon,
                },
            };

            this.pageVersions.push(currentVersion);
        }

        if (versions?.length) {
            this.pageVersions.push(...versions);
        }
        if (this.pageVersions.length) {
            this.selectedVersionId = this.pageVersions[0].id;
        }
    }

    formatDate(date: Date) {
        return new Date(date).toLocaleString();
    }

    restoreVersion(close: any) {
        this.$vfm.show({
            component: () =>
                import('~/components/modal/RestoreVersionModal.vue'),
            bind: {
                version: this.pageVersion,
            },
            on: {
                confirm: () => {
                    if (!this.pageVersion) return;
                    this.$entities.page.restoreFromVersion(
                        this.id,
                        this.pageVersion.id,
                    );
                    close();
                },
            },
        });
    }
}
</script>

<style lang="scss" scoped>
::v-deep {
    .vfm__container {
        padding-bottom: 5vh !important;
        padding-top: 5vh !important;
    }
}

.page-versions {
    @include modal;
    height: 100%;
    width: 100%;
    padding: 0px 0px 0px 0px;
    display: flex;

    &__content {
        position: relative;
        width: 100%;
        height: 100%;
        max-width: calc(100% - 256px);

        &__wrapper {
            @include scrollbar(70px);
            scrollbar-gutter: stable;
            overflow-y: auto;
            height: 100%;
            position: relative;
            top: -70px;
            padding-top: 90px;
            padding-bottom: 32px;
        }

        &__date {
            font-variant-numeric: tabular-nums;
            @include font14-600;
            position: sticky;
            top: 0;
            z-index: 1;
            border-top-left-radius: 12px;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 19px 16px 12px 32px;
            border-bottom: 1px solid var(--tab-divider-color);
            height: 70px;
            background: var(--jira-panel-header-bg-color);
            -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
            backdrop-filter: blur(12px); /* Chrome and Opera */
        }

        &__title {
            @include inputMetaStyles;
            font-weight: bold;
            font-size: 26px;
            line-height: 40px;
            width: 100%;
            margin-bottom: 5px;
            padding: 0 16px 0 32px;
        }

        &__editor {
            padding: 0 16px 0 32px;
        }
    }

    &__list {
        border-left: 1px solid var(--tab-divider-color);
        @include scrollbar(8px, 8px);
        user-select: none;
        scrollbar-gutter: stable;
        overflow-y: auto;
        max-width: 256px;
        width: 100%;
        padding: 16px 12px 20px 20px;
        margin-right: 6px;
        flex-shrink: 0;

        &__header {
            @include ellipsis;
            @include font10-700;
            text-transform: uppercase;
            color: var(--settings-modal-sidebar-title-color);
            padding: 0 10px;
            font-weight: 700;
            font-size: 11px;
            line-height: 18px;
            margin-bottom: 3px;
            width: 100%;
        }

        &__versions {
            &__version {
                @include font12-500;
                outline: none;
                display: block;
                padding: 6px 10px;
                width: 100%;
                border-radius: 6px;
                text-align: left;
                margin-bottom: 2px;
                color: var(--settings-modal-sidebar-item-text-color);

                &.selected,
                &:hover {
                    color: var(--settings-modal-sidebar-item-text-color__hover);
                    background: var(
                        --settings-modal-sidebar-item-bg-color__hover
                    );
                }
            }
        }
    }
}
</style>
