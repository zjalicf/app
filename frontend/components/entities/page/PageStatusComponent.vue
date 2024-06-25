<template>
    <div class="page-status">
        <div class="page-status__wrapper">
            <ASelect
                ref="statusSelect"
                :items="pageStatuses"
                :value="selectedStatus"
                :dropdown-width="170"
                :search="true"
                :clear="false"
                :show-arrow="false"
                :allow-new="false"
                :multi="false"
                :tiny="tiny"
                :value-transformer="valueTransformer"
                :label-transformer="labelTransformer"
                :show-null-value-options="selectedStatus"
                search-placeholder="Status"
                check-placement="end"
                placeholder="Set Status"
                placement="bottom-start"
                @change="handleStatusChange"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import { PageStatus } from '~/constants';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import {
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'PageStatusComponent',
    components: { InterfaceDelete1, ASelect },
})
export default class PageStatusComponent extends Vue {
    @Prop({ default: null })
    entityId!: string;

    @Prop({ default: false })
    tiny!: boolean;

    @Prop({ default: undefined })
    source!: TrackingActionSource | undefined;

    @Prop({ default: undefined })
    sourceMeta!: TrackingActionSourceMeta | undefined;

    $refs!: {
        statusSelect: any;
    };

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

    get selectedStatus() {
        if (!this.page || !this.page.pageStatus) {
            return null;
        }
        return this.page.pageStatus;
    }

    get page() {
        return this.$store.getters['document/byId'](this.entityId) ?? null;
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

    handleStatusChange(status: PageStatus) {
        this.$entities.page.changeStatus(this.page, status);

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: this.$tracking.resolveActionFromPageStatus(status),
            source: this.source,
            sourceMeta: this.sourceMeta,
            entityId: this.entityId,
        });
    }
}
</script>
<style lang="scss" scoped>
.page-status {
    &__wrapper {
        display: grid;
        grid-template-columns: 1fr min-content;
        border-radius: 6px;
        align-items: center;
    }
}
</style>
