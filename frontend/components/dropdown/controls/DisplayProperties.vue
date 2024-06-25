<template>
    <div class="display-properties">
        <button
            v-for="property of properties"
            :key="property"
            class="display-properties--property"
            :class="{ selected: selected.includes(property) }"
            @click="updateDisplayProperties(property)"
        >
            {{ property }}
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CSwitch from '~/components/CSwitch.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'DisplayIssues',
    components: { CSwitch },
})
export default class DisplayIssues extends Vue {
    @Prop({ required: true })
    tabId!: string;

    get properties() {
        return (
            this.$store.getters['tabs/byId'](this.tabId).data
                .displayProperties ?? []
        );
    }

    get selected() {
        return (
            this.$store.getters['tabs/byId'](this.tabId).data
                .selectedDisplayProperties ?? []
        );
    }

    updateDisplayProperties(property: string) {
        let payload;
        const oldData = { selectedDisplayProperties: [...this.selected] };

        if (this.selected.includes(property)) {
            payload = {
                selectedDisplayProperties: this.selected.filter(
                    (prop: string) => prop !== property,
                ),
            };
        } else {
            payload = {
                selectedDisplayProperties: [...this.selected, property],
            };
        }
        this.$store.dispatch('vaultSettings/updateIntegrationsOptions', {
            jira: payload,
        });
        this.updateTabData(payload);

        this.$tracking.trackDropdownEvent(
            TrackingType.JIRA,
            {
                selectedDisplayProperties: payload.selectedDisplayProperties,
            },
            oldData,
        );
    }

    updateTabData(data: any) {
        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.tabId,
            data,
        });
    }
}
</script>
<style lang="scss" scoped>
.display-properties {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    &--property {
        @include font12-500;
        padding: 5px 8px;
        color: var(--dropdown-controls-display-properties-text-color);
        background: var(--dropdown-controls-display-properties-bg-color);
        border-radius: 6px;

        &.selected {
            color: var(
                --dropdown-controls-display-properties-text-color__selected
            );
            background: var(
                --dropdown-controls-display-properties-bg-color__selected
            );

            &:hover {
                background: var(
                    --dropdown-controls-display-properties-bg-color__selected__hover
                );
            }
        }

        &:hover {
            color: var(
                --dropdown-controls-display-properties-text-color__selected
            );
            background: var(
                --dropdown-controls-display-properties-bg-color__selected
            );
        }
    }
}
</style>
