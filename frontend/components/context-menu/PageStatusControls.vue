<template>
    <div class="page-status-controls">
        <DropdownButton
            ref="status"
            :class="{ active: active === 'status' }"
            class="page-status-controls__button"
            @mouseenter="showStatusDropdown"
        >
            <div class="page-status-controls__left">
                <InterfaceEditSelectAreaCircleDash class="icon" />
                Status
            </div>
            <TriangleRight class="small-icon" size="8" />
        </DropdownButton>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TriangleRight } from '~/components/icons';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import ADropDown from '~/components/ADropDown.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import { IDocument } from '~/components/document/model';
import { PageStatus } from '~/constants';
import InProgressIcon from '~/components/icons/InProgressIcon.vue';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import {
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'PageStatusControls',
    components: {
        InterfaceEditSelectAreaCircleDash,
        InProgressIcon,
        DropdownButton,
        JiraIcon,
        TriangleRight,
    },
})
export default class PageStatusControls extends Vue {
    @Prop({ required: true })
    page!: IDocument;

    @Prop({ default: undefined })
    source!: TrackingActionSource | undefined;

    @Prop({ default: undefined })
    sourceMeta!: TrackingActionSourceMeta | undefined;

    $refs!: {
        status: any;
    };

    picker: string | null = null;
    active: string | null = '';
    selected: any[] = [];

    get selectedStatus() {
        if (!this.page || !this.page.pageStatus) {
            return null;
        }
        return this.page.pageStatus;
    }

    get pageStatuses() {
        const statuses = Object.values(PageStatus).map(status => ({
            id: status,
            icon: this.$utils.page.getWorkflowIcon(status),
            label: status,
        }));
        if (this.selectedStatus) {
            statuses.push({
                // @ts-ignore
                id: null,
                icon: this.$utils.page.getWorkflowIcon(null),
                // @ts-ignore
                label: 'Clear Status',
            });
        } else {
            statuses.push({
                // @ts-ignore
                id: null,
                icon: this.$utils.page.getWorkflowIcon('no status'),
                // @ts-ignore
                label: 'No Status',
            });
        }
        return statuses;
    }

    capitalize(label: string) {
        const arr = label.split(' ');
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        return arr.join(' ');
    }

    labelTransformer(label: string) {
        return this.capitalize(label);
    }

    valueTransformer(value: any) {
        if (value.id) return this.capitalize(value.label);
        return 'No Status';
    }

    async showStatusDropdown() {
        await this.$nextTick();
        if (this.active !== 'status') {
            this.hideOptions();
            this.active = 'status';
        }
        this.$dropdown.show({
            name: 'page-status',
            parent: this.$refs.status.$el,
            component: ADropDown,
            animate: false,
            retainFocus: true,
            backdrop: false,
            popperOptions: {
                placement: 'right-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [-6, 7],
                        },
                    },
                ],
            },
            bind: {
                items: this.pageStatuses,
                value: this.page.pageStatus ?? null,
                search: true,
                clear: false,
                multi: false,
                valueTransformer: this.valueTransformer,
                labelTransformer: this.labelTransformer,
                checkPlacement: 'end',
                showNullValueOptions: this.selectedStatus,
            },
            on: {
                change: (value: any) => {
                    this.$dropdown.hideAll();
                    this.$emit('close');
                    this.handleStatusChange(value);
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    handleStatusChange(status: any) {
        this.hideOptions();
        this.$emit('close');
        this.$entities.page.changeStatus(this.page, status);

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: this.$tracking.resolveActionFromPageStatus(status),
            source: this.source,
            sourceMeta: this.sourceMeta,
            entityId: this.page.id,
        });
    }

    hideOptions() {
        this.$dropdown.hide('page-status');
        this.active = null;
    }

    beforeDestroy() {
        this.$nuxt.$off('dropdown-button-hover');
    }

    mounted() {
        this.$nuxt.$on('dropdown-button-hover', () => {
            this.hideOptions();
        });
    }
}
</script>

<style lang="scss" scoped>
.page-status-controls {
    @include contextMenu;
    padding: 0;

    &__title {
        @include font10-700;
        padding: 3px 8px 0;
        color: var(--context-menu-section-title);
        text-transform: uppercase;
    }

    &__left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    &__button {
        justify-content: space-between;
    }
}
</style>
