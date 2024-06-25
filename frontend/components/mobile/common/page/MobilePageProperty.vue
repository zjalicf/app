<template>
    <button class="mobile-page-property" @click="openPropertyDropdown">
        <div class="mobile-page-property__label">
            <component :is="property.icon" class="icon" size="16" />{{
                property.property
            }}
        </div>
        <div class="mobile-page-property__value">
            <component
                :is="property.value.icon.icon"
                v-if="property.value.icon"
                class="property-icon"
                size="16"
                :style="{ color: property.value.icon.color }"
            />{{ property.value.value }}
        </div>
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'MobilePageProperty',
})
export default class MobilePageProperty extends Vue {
    @Prop({ required: true })
    property!: any;

    openPropertyDropdown() {
        this.property.callback();
    }
}
</script>
<style lang="scss" scoped>
.mobile-page-property {
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    justify-items: start;
    padding: 12px 14px;
    width: 100%;
    border-radius: 6px;

    &:not(:last-child) {
        margin-bottom: 4px;
    }

    &:active {
        background: $blueGrey100-10;
    }
    &__label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: $blueGrey400;

        &.icon {
            flex-shrink: 0;
            color: $blueGrey500;
        }
    }

    &__value {
        display: flex;
        align-items: center;
        gap: 8px;
        color: $white;

        &.property-icon {
            flex-shrink: 0;
        }
    }
}
</style>
