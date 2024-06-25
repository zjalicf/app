<template>
    <div class="github-display-properties">
        <button
            v-for="property of properties"
            :key="property"
            class="github-display-properties--property"
            :class="{ selected: selected.includes(property) }"
            @click="updateDisplayProperties(property)"
        >
            {{ property }}
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import cloneDeep from 'lodash/cloneDeep';
import CSwitch from '~/components/CSwitch.vue';

@Component({
    name: 'GithubDisplayProperties',
    components: { CSwitch },
})
export default class GithubDisplayProperties extends Vue {
    @Prop({ required: true })
    tabId!: string;

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data;
    }

    get properties() {
        return this.tabData?.displayProperties ?? [];
    }

    get selected() {
        return this.tabData?.selectedDisplayProperties ?? [];
    }

    updateDisplayProperties(property: string) {
        let payload;

        if (this.selected.includes(property)) {
            payload = this.selected.filter((prop: string) => prop !== property);
        } else {
            payload = [...this.selected, property];
        }

        this.$emit('updateOptions', { selectedDisplayProperties: payload });
    }
}
</script>
<style lang="scss" scoped>
.github-display-properties {
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
