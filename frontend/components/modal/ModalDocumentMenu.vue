<template>
    <div class="modal-document-menu">
        <CDropDownSimple ref="dropDown">
            <template #default>
                <button
                    v-if="displayTitle"
                    ref="button"
                    class="modal-document-menu__selector"
                >
                    <InterfaceContentFileAlternate class="icon" />
                    <div>{{ title }}</div>
                </button>
                <button
                    v-else
                    ref="button"
                    class="modal-document-menu__selector"
                >
                    <InterfaceContentFileAlternate class="no-title icon" />
                </button>
            </template>
            <template #dropdown="{ close }">
                <div class="modal-document-menu__dropdown">
                    <div class="modal-document-menu__dropdown__header">
                        <div
                            class="modal-document-menu__dropdown__header__title"
                        >
                            {{ title }}
                        </div>
                        <button
                            v-if="sharingUuid && !isTask"
                            v-tippy="{
                                placement: 'bottom',
                                theme: 'tooltip',
                                delay: [150, 20],
                                touch: false,
                                offset: '0, -5',
                            }"
                            :content="`<div class='tooltip'>Public</div>`"
                        >
                            <TravelMapEarth1 size="14" class="icon" />
                        </button>
                    </div>
                    <div class="modal-document-menu__dropdown__footer">
                        <button
                            v-if="!sharingUuid && !isTask && !localVaultActive"
                            v-pro:click.style="() => publishDocument(close)"
                            class="
                                modal-document-menu__dropdown__footer__option
                            "
                        >
                            <TravelMapEarth1 size="14" class="icon" />
                            Publish
                        </button>
                        <button
                            v-else-if="sharingUuid && !isTask"
                            v-pro:click.style="() => unpublishDocument(close)"
                            class="
                                modal-document-menu__dropdown__footer__option
                            "
                        >
                            <InterfacePadLockShield size="14" class="icon" />
                            Unpublish
                        </button>
                        <button
                            class="
                                modal-document-menu__dropdown__footer__option
                            "
                            @click="openDocument"
                        >
                            <InterfaceContentFileAlternate
                                size="14"
                                class="icon"
                            />
                            Open
                        </button>
                        <button
                            class="
                                modal-document-menu__dropdown__footer__option
                            "
                            @click="removeReference"
                        >
                            <InterfaceDelete1 size="14" class="icon" />
                            Clear
                        </button>
                    </div>
                </div>
            </template>
        </CDropDownSimple>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    DocumentDownloadIcon,
    DocumentIcon,
    GlobeIcon,
    HandIcon,
    XIcon,
} from '@vue-hero-icons/solid';
import ProjectSelector from '@/components/header/ProjectSelector.vue';
import CDropDownSimple from '@/components/CDropDownSimple.vue';
import { ProRequired } from '~/helpers/decorators';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import TravelMapGlobeAlternate from '~/components/streamline/TravelMapGlobeAlternate.vue';
import TravelMapGlobe from '~/components/streamline/TravelMapGlobe.vue';
import TravelMapEarth1 from '~/components/streamline/TravelMapEarth1.vue';
import InterfacePadLockShield from '~/components/streamline/InterfacePadLockShield.vue';

@Component({
    name: 'ModalDocumentMenu',
    components: {
        InterfacePadLockShield,
        TravelMapEarth1,
        TravelMapGlobe,
        TravelMapGlobeAlternate,
        InterfaceDelete1,
        InterfaceContentFileAlternate,
        ProjectSelector,
        DocumentIcon,
        XIcon,
        CDropDownSimple,
        GlobeIcon,
        HandIcon,
        DocumentDownloadIcon,
    },
})
export default class ModalDocumentMenu extends Vue {
    @Prop({ default: 'Untitled' })
    title!: string;

    @Prop({ default: false })
    displayTitle!: boolean;

    @Prop()
    isTask!: boolean;

    @Prop({ default: false })
    sharingUuid!: string | null;

    @Prop({ default: true })
    localVaultActive!: boolean;

    @ProRequired
    publishDocument(close: Function) {
        close();
        this.$emit('document-publish');
    }

    @ProRequired
    unpublishDocument(close: Function) {
        close();
        this.$emit('document-unpublish');
    }

    openDocument() {
        this.$emit('document-open');
    }

    removeReference() {
        this.$emit('document-clear');
    }
}
</script>

<style lang="scss" scoped>
.modal-document-menu {
    // ok
    :deep(.c-select--selected) {
        padding: 0;

        &.open button {
            background: var(--a-select-button-highlight-bg);
        }
    }
}

.modal-document-menu {
    position: relative;
    border-radius: 8px;
    top: 100%;
    transform-origin: top left;

    &__selector {
        .icon {
            flex-shrink: 0;
        }

        .no-title.icon {
            margin-right: 0px !important;
        }

        div {
            @include ellipsis;
        }

        @include font12-500;
        max-width: 170px;
        outline: none;
        padding: 7px;
        border-radius: 6px;
        color: var(--a-select-text-default-color);
        cursor: default;
        text-align: left;
        display: flex;
        align-items: center;
        background: var(--a-select-button-default-bg);
        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);

        &:focus {
            outline: none;
        }

        .icon {
            color: var(--a-select-icon-default-color);
            margin-right: 6px;
        }

        &:hover {
            color: var(--a-select-text-highlight-color);
            background: var(--a-select-button-highlight-bg);

            .icon {
                color: var(--a-select-icon-default-color);
            }
        }
    }

    &__dropdown {
        min-width: 160px;
        max-width: 240px;

        &__header {
            @include font12-500;
            color: var(--event-modal-document-dropdown-text-color);
            padding: 2px 4px 8px;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: space-between;

            &__title {
                @include ellipsis;
            }

            button {
                color: var(--event-modal-document-dropdown-button-text-color);
                display: block;
                flex-shrink: 0;
                margin-left: 8px;
            }
        }

        &__footer {
            .icon {
                margin-right: 8px;
            }

            padding-top: 8px;
            border-top: 1px solid var(--tab-divider-color);

            &__option {
                @include font12-500;
                background: var(
                    --event-modal-document-dropdown-option-bg-color
                );
                outline: none;
                padding: 4px 8px 4px 6px;
                border-radius: 6px;
                color: var(--event-modal-document-dropdown-option-text-color);
                cursor: default;
                text-align: left;
                display: flex;
                align-items: center;
                min-width: 160px;
                width: 100%;

                .icon {
                    color: var(
                        --event-modal-document-dropdown-option-icon-color
                    );
                }

                &:hover {
                    @include frostedGlassButton;
                    color: var(
                        --event-modal-document-dropdown-option-text-color__hover
                    );

                    .icon {
                        color: var(
                            --event-modal-document-dropdown-option-icon-color__hover
                        );
                    }
                }
            }
        }
    }
}
</style>
