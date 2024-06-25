<template>
    <div class="dropdown-pane">
        <div class="dropdown-pane__title">{{ title }}</div>
        <div class="dropdown-pane__options">
            <button
                v-for="option in options"
                :key="option.id"
                class="dropdown-pane__options__option"
                @click="onSelected(option.id)"
            >
                <div class="dropdown-pane__options__option__title">
                    {{ option.label }}
                </div>
                <div class="dropdown-pane__options__option__icon">
                    <InterfaceValidationCheck v-if="option.id === value" />
                </div>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';

@Component({
    name: 'DropdownPane',
    components: {
        InterfaceValidationCheck,
    },
})
export default class DropdownPane extends Vue {
    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    options!: any[];

    @Prop({ required: true })
    value!: string;

    onSelected(option: string) {
        this.$emit('select', option);
    }
}
</script>
<style lang="scss" scoped>
.dropdown-pane {
    @include mobileDropdown;

    &__options {
        &__option {
            grid-template-columns: minmax(0, 1fr) 16px;
            &__title {
                order: 0;
            }

            &__icon {
                order: 1;
            }
        }
    }
}
</style>
