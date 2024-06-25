<template>
    <div
        class="a-select"
        :class="{
            'a-select__has-value': hasValue,
            'a-select__active': active,
            'a-select--tiny': tiny,
            readonly,
        }"
    >
        <button
            ref="select"
            class="a-select__button"
            :class="{
                'a-select__button--tiny': tiny,
                'a-select__button--clear': allowClear,
            }"
            :style="{
                width: !tiny && width ? `${width}px` : 'auto',
                maxWidth: !tiny && maxWidth ? `${maxWidth}px` : 'auto',
            }"
            @click.prevent.stop="openDropdown"
        >
            <div class="a-select__button__value">
                <ASelectMedia
                    v-if="valueMedia"
                    :value="valueMedia"
                    :tiny="tiny"
                />
                <component :is="valueIcon" v-if="valueIcon" class="icon" />
                <span v-if="!tiny" class="a-select__button__value__text">{{
                    valueText
                }}</span>
            </div>
            <div
                v-if="showArrow && !readonly"
                class="a-select__button__icon-wrapper"
            >
                <AcreomArrowUp v-if="active" class="a-select__button__icon" />
                <AcreomArrowDown v-else class="a-select__button__icon" />
            </div>
        </button>
        <button v-if="allowClear" class="a-select__clear" @click="clearValue">
            <InterfaceDelete1 class="icon" size="10" />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Placement } from '@popperjs/core';
import { AsyncComponent, Component as ComponentType } from 'vue';
import ADropDown from '~/components/ADropDown.vue';
import AcreomArrowDown from '~/components/icons/AcreomArrowDown.vue';
import AcreomArrowUp from '~/components/icons/AcreomArrowUp.vue';
import ASelectMedia from '~/components/ASelectMedia.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';

@Component({
    name: 'ASelect',
    components: {
        InterfaceDelete1,
        ASelectMedia,
        AcreomArrowUp,
        AcreomArrowDown,
    },
})
export default class ASelect extends Vue {
    @Prop({ required: true })
    items!: {
        id: string;
        label: string;
        icon: string;
        alt: string;
        img: string;
    }[];

    @Prop({ default: null })
    value!: string | string[] | null;

    @Prop({ default: false })
    search!: boolean;

    @Prop({ default: false })
    clear!: boolean;

    @Prop({ default: false })
    multi!: boolean;

    @Prop({ default: false })
    multiselectIcons!: boolean;

    @Prop({ default: '' })
    searchPlaceholder!: string;

    @Prop({ default: 'Select' })
    placeholder!: string;

    @Prop({ default: null })
    width!: number | null;

    @Prop({ default: null })
    maxWidth!: number | null;

    @Prop({ default: null })
    dropdownWidth!: number | null;

    @Prop({ default: 'bottom-start' })
    placement!: Placement;

    @Prop({ default: 'start' })
    checkPlacement!: string;

    @Prop({ default: 'a-select' })
    name!: string;

    @Prop({ default: true })
    showArrow!: boolean;

    @Prop({ default: false })
    allowNew!: boolean;

    @Prop({ default: false })
    tiny!: boolean;

    @Prop({ default: false })
    allowClear!: boolean;

    @Prop({ default: true })
    showNullValueOptions!: boolean;

    @Prop({ default: null })
    labelTransformer!: (label: string) => string;

    @Prop({ default: null })
    valueTransformer!: (label: any) => string;

    @Prop({ default: null })
    valueIcon!: ComponentType | AsyncComponent;

    @Prop({ default: false })
    emitOnClose!: boolean;

    @Prop({ default: null })
    focusElementOnMounted!: string | null;

    @Prop({ default: false })
    readonly!: boolean;

    $refs!: {
        select: HTMLButtonElement;
    };

    active: boolean = false;
    localValue: string | string[] | null = null;

    get valueMedia() {
        const selectedItem = this.items.find(({ id }) => id === this.value);
        if (!selectedItem) return null;
        return (
            selectedItem.icon ??
            (selectedItem.img && {
                img: selectedItem.img,
                alt: selectedItem.alt,
            }) ??
            null
        );
    }

    get valueText() {
        if (this.multi) {
            if (!this.value?.length) return this.placeholder;
            if (this.valueTransformer) {
                return this.valueTransformer(
                    (this.value as string[]).map((_id: string) => {
                        const val = this.items.find(({ id }) => id === _id);
                        if (val) {
                            return val.label;
                        }
                        return null;
                    }),
                );
            }

            return (this.value as string[])
                .map((_id: string) => {
                    const val = this.items.find(({ id }) => id === _id);
                    if (val) {
                        return this.labelTransformer
                            ? this.labelTransformer(val.label)
                            : val.label;
                    }
                    return null;
                })
                .join(', ');
        }
        const selectedItem = this.items.find(({ id }) => id === this.value);
        if (selectedItem) {
            if (this.valueTransformer) {
                return this.valueTransformer(selectedItem);
            }

            return selectedItem.label;
        }

        return this.placeholder;
    }

    get hasValue() {
        if (this.multi) {
            return (this.value as string[]).length;
        }
        if (this.value === null) return false;
        return this.items.some(({ id }) => id === this.value);
    }

    openDropdown() {
        if (this.readonly) return;
        this.active = true;
        this.$dropdown.show({
            parent: this.$refs.select,
            name: this.name,
            component: ADropDown,
            retainFocus: this.search,
            popperOptions: {
                placement: this.placement,
            },
            bind: {
                items: this.items,
                value: this.value,
                parentWidth: this.width,
                width: this.dropdownWidth,
                search: this.search,
                clear: this.clear,
                multi: this.multi,
                multiselectIcons: this.multiselectIcons,
                searchPlaceholder: this.searchPlaceholder,
                checkPlacement: this.checkPlacement,
                allowNew: this.allowNew,
                labelTransformer: this.labelTransformer,
                showNullValueOptions: this.showNullValueOptions,
                focusElementOnMounted: this.focusElementOnMounted,
            },
            on: {
                change: (value: string | string[] | null) => {
                    if (this.multi) {
                        this.localValue = value;
                        if (this.emitOnClose) {
                            return;
                        }
                    } else {
                        this.$dropdown.hide(this.name);
                    }

                    this.$emit('change', value);
                },
            },
            onClose: () => {
                if (this.multi && this.emitOnClose) {
                    this.$emit('change', this.localValue);
                }
                this.$emit('close');
                this.active = false;
            },
        });
    }

    beforeDestroy() {
        this.closeDropdown();
    }

    closeDropdown() {
        this.$dropdown.hide(this.name);
    }

    clearValue() {
        this.$emit('change', null);
    }

    beforeMount() {
        if (this.multi) {
            this.localValue = [...(this.value as string[])];
            return;
        }
        this.localValue = this.value;
    }
}
</script>
<style lang="scss" scoped>
.a-select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2px;
    @include font-inter;

    &__button {
        @include font12-500;
        border-radius: 6px;
        padding: 5px 10px 5px 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--a-select-button-default-bg);
        color: var(--a-select-text-default-color);

        &--tiny {
            padding: 0;
            background: none;
        }

        &--clear {
            border-radius: 6px 2px 2px 6px;
        }

        &:not(.readonly &):hover {
            background: var(--a-select-button-highlight-bg);
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
        }

        &__value {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            overflow: hidden;

            &__media,
            .icon {
                flex-shrink: 0;
                margin-right: 6px;
            }

            &__text {
                @include ellipsis;
            }
        }

        &__icon {
            color: var(--a-select-icon-default-color);
            flex-shrink: 0;
        }

        .a-select__has-value & {
            color: var(--a-select-text-highlight-color);
        }

        .a-select__active & {
            background: var(--a-select-button-highlight-bg);
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
        }
    }

    &__clear {
        padding: 9px 10px;
        background: var(--a-select-button-default-bg);
        color: var(--a-select-text-default-color);
        border-radius: 2px 6px 6px 2px;

        &:hover {
            background: var(--a-select-button-highlight-bg);
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
        }
    }
}
</style>
