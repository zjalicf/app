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
import { LinearDisplayPropertiesOptions } from '~/components/linear/constants';

@Component({
    name: 'LinearDisplayProperties',
    components: { CSwitch },
})
export default class LinearDisplayProperties extends Vue {
    @Prop({ required: true })
    viewId!: string;

    displayPropertiesOptions = Object.values(LinearDisplayPropertiesOptions);

    get viewDefinition() {
        return this.$entities.linear.getViewDefinition(this.viewId);
    }

    get properties() {
        return this.displayPropertiesOptions ?? [];
    }

    get selected() {
        return this.viewDefinition.displayProperties ?? [];
    }

    updateDisplayProperties(property: string) {
        if (this.selected.includes(property)) {
            this.$emit('update', {
                displayProperties: this.selected.filter(
                    (prop: string) => prop !== property,
                ),
            });
            return;
        }
        this.$emit('update', {
            displayProperties: [...this.selected, property],
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
