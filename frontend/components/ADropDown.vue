<template>
    <div
        class="a-dropdown"
        :class="{ styled }"
        :style="{
            'min-width': parentWidth ? `${parentWidth}px` : 'auto',
            'max-width': width ? `${width}px` : 'auto',
        }"
    >
        <div v-if="search" class="a-dropdown__header">
            <input
                ref="search"
                :value="queryString"
                type="text"
                :placeholder="searchPlaceholder"
                @input="handleInput"
                @keydown.esc.prevent="handleEscKey"
                @keydown.enter.prevent="handleEnterKey"
                @keydown.up.prevent="handleUpKey"
                @keydown.down.prevent="handleDownKey"
            />
        </div>
        <div v-if="multi" class="a-dropdown__body">
            <div v-if="!sortedResults.length && search">
                <div class="a-dropdown__body__no-results">
                    {{ noResultsPlaceholder }}
                </div>
            </div>
            <div v-else>
                <div
                    v-for="(item, index) in sortedResults"
                    :id="item.id"
                    :key="item.id"
                    class="
                        a-dropdown__body__value a-dropdown__body__value--multi
                    "
                    :class="[
                        localValue.includes(item.id) &&
                            'a-dropdown__body__value__selected',
                        `a-dropdown__body__value__check-${checkPlacement}`,
                        index === selectedIndex &&
                            'a-dropdown__body__value__highlighted',
                    ]"
                    @mouseover="selectedIndex = index"
                    @click="item.new ? updateNewMulti(item.id, $event) : null"
                >
                    <label
                        class="a-dropdown__body__value__text-wrapper"
                        :class="[
                            `a-dropdown__body__value__text-wrapper__check-${checkPlacement}`,
                        ]"
                        :for="`item-${index}`"
                    >
                        <ACheck
                            v-if="!item.new"
                            :id="`item-${index}`"
                            class="a-dropdown__body__value__check"
                            :value="localValue.includes(item.id)"
                            @change="updateMulti(item.id)"
                        />
                        <div v-else class="a-dropdown__body__value__add">
                            <InterfaceAdd1 class="icon" size="14" />
                        </div>
                        <ASelectMedia
                            v-if="multiselectIcons && itemMedia(item)"
                            :value="itemMedia(item)"
                        />
                        <span class="a-dropdown__body__value__text">{{
                            labelTransformer
                                ? labelTransformer(item.label)
                                : item.label
                        }}</span>
                    </label>
                </div>
            </div>
        </div>
        <div v-else class="a-dropdown__body">
            <div v-if="!sortedResults.length && search">
                <div class="a-dropdown__body__no-results">
                    {{ noResultsPlaceholder }}
                </div>
            </div>
            <div v-else>
                <button
                    v-for="(item, index) in sortedResults"
                    :id="item.id"
                    :key="item.id"
                    class="a-dropdown__body__value"
                    :class="[
                        item.id === localValue &&
                            'a-dropdown__body__value__selected',
                        (item.img || item.icon) &&
                            'a-dropdown__body__value__has-img',
                        index === selectedIndex &&
                            'a-dropdown__body__value__highlighted',
                        `a-dropdown__body__value__check-${checkPlacement}`,
                    ]"
                    @click="updateSingle(item.id)"
                    @mouseover="selectedIndex = index"
                >
                    <InterfaceValidationCheck
                        v-if="
                            item.id === localValue && checkPlacement === 'start'
                        "
                        class="a-dropdown__body__value__icon"
                    />
                    <div class="a-dropdown__body__value__text-wrapper">
                        <ASelectMedia
                            v-if="itemMedia(item)"
                            :value="itemMedia(item)"
                        />
                        <span class="a-dropdown__body__value__text">{{
                            labelTransformer
                                ? labelTransformer(item.label)
                                : item.label
                        }}</span>
                    </div>
                    <InterfaceValidationCheck
                        v-if="
                            item.id === localValue && checkPlacement === 'end'
                        "
                        class="a-dropdown__body__value__icon"
                    />
                </button>
            </div>
        </div>
        <button v-if="clear" class="a-dropdown__clear" @click="clearSelect">
            Clear
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import scrollIntoView from 'scroll-into-view';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import ACheck from '~/components/system/ACheck/ACheck.vue';
import ASelectMedia from '~/components/ASelectMedia.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';

@Component({
    name: 'ADropDown',
    components: {
        InterfaceAdd1,
        ASelectMedia,
        ACheck,
        InterfaceValidationCheck,
    },
})
export default class ADropDown extends Vue {
    @Prop({ required: true })
    items!: any[];

    @Prop({ default: null })
    value!: any;

    @Prop({ default: false })
    search!: boolean;

    @Prop({ default: false })
    multi!: boolean;

    @Prop({ default: false })
    multiselectIcons!: boolean;

    @Prop({ default: null })
    parentWidth!: number | null;

    @Prop({ default: null })
    width!: number | null;

    @Prop({ default: '' })
    searchPlaceholder!: string;

    @Prop({ default: 'start' })
    checkPlacement!: string;

    @Prop({ default: false })
    navigable!: boolean;

    @Prop({ default: false })
    clear!: boolean;

    @Prop({ default: false })
    allowNew!: boolean;

    @Prop({ default: true })
    styled!: boolean;

    @Prop({ default: null })
    defaultNewOption!: any;

    @Prop({ default: null })
    labelTransformer!: (label: string) => string;

    @Prop({ default: 'No results found' })
    noResultsPlaceholder!: string;

    @Prop({ default: true })
    showNullValueOptions!: boolean;

    @Prop({ default: false })
    closeOnUpdate!: boolean;

    @Prop({ default: null })
    focusElementOnMounted!: string | null;

    $refs!: {
        search: HTMLInputElement;
    };

    localValue: any = null;

    queryString: string = '';
    selectedIndex: number = 0;

    sortedResults: any[] = [];

    @Watch('value', { immediate: true })
    handleValueChange(newValue: any) {
        this.localValue = newValue;
    }

    sortResults() {
        if (!this.multi) {
            this.sortedResults = this.searchResults;
            return;
        }
        this.sortedResults = this.searchResults.sort((a, b) => {
            if (!a.id) return 1;
            if (!b.id) return 1;
            if (
                this.localValue.includes(a.id) &&
                !this.localValue.includes(b.id)
            )
                return -1;
            if (
                this.localValue.includes(b.id) &&
                !this.localValue.includes(a.id)
            )
                return 1;
            if (
                this.localValue.includes(a.id) &&
                this.localValue.includes(b.id)
            )
                return a.label.localeCompare(b.label);
            return a.label.localeCompare(b.label);
        });
    }

    get searchResults() {
        const items = [
            ...this.items,
            // ...this.localValue.map((val: string) => ({ label: val, id: val })),
        ];
        if (this.allowNew && this.defaultNewOption) {
            items.unshift(this.defaultNewOption);
        }
        if (!this.search || !this.queryString.length)
            return items.filter(item =>
                this.showNullValueOptions ? true : item.id !== null,
            );

        const isDefaultOption = (item: any) =>
            item.id === this.defaultNewOption?.id;
        const matchesSearch = (item: any) => {
            return (
                item.label
                    ?.toLowerCase()
                    .includes(
                        this.queryString.toLowerCase().replaceAll(' ', '-'),
                    ) ||
                item.label
                    ?.toLowerCase()
                    .includes(this.queryString.toLowerCase())
            );
        };

        const results = items.filter(
            el => matchesSearch(el) || isDefaultOption(el),
        );

        if (
            this.allowNew &&
            this.queryString.length > 0 &&
            !results.filter(res => res.id === this.queryString).length
        ) {
            if (
                results.length === 1 &&
                results[0].label ===
                    this.queryString.toLowerCase().replaceAll(' ', '-')
            ) {
            } else {
                results.push({
                    id: this.queryString.toLowerCase(),
                    label: `${this.queryString
                        .toLowerCase()
                        .replaceAll(' ', '-')}`, // TODO: transform spaces to dashes
                    new: true,
                });
            }
        }
        return results.filter(item =>
            this.showNullValueOptions ? true : item.id !== null,
        );
    }

    itemMedia(item: any) {
        return (
            item.icon ??
            (item.img && {
                img: item.img,
                alt: item.alt,
            }) ??
            null
        );
    }

    handleInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;

        if (this.queryString.length === 0 && value.trim().length === 0) {
            this.handleEnterKey();
        }

        this.queryString = value === ' ' ? '' : value;

        if (this.selectedIndex >= this.searchResults.length)
            this.selectedIndex = 0;
        this.sortResults();
    }

    handleEscKey(e: KeyboardEvent) {
        e.stopPropagation();
        this.$emit('close');
    }

    handleUpKey() {
        this.selectedIndex--;
        if (this.selectedIndex < 0) {
            this.selectedIndex = this.searchResults.length - 1;
        }

        const result = this.searchResults[this.selectedIndex];

        if (result && result.id) {
            const el = document?.getElementById(
                this.searchResults[this.selectedIndex].id,
            );

            if (el) {
                scrollIntoView(el, {
                    time: 50,
                });
            }
        }
    }

    handleDownKey() {
        this.selectedIndex++;
        if (this.selectedIndex >= this.searchResults.length) {
            this.selectedIndex = 0;
        }

        const result = this.searchResults[this.selectedIndex];

        if (result && result.id) {
            const el = document?.getElementById(
                this.searchResults[this.selectedIndex].id,
            );

            if (el) {
                scrollIntoView(el, {
                    time: 50,
                });
            }
        }
    }

    handleEnterKey(event?: KeyboardEvent) {
        if (this.searchResults.length) {
            if (this.multi) {
                this.updateMulti(this.searchResults[this.selectedIndex].id);
                this.queryString = '';
            } else {
                this.updateSingle(this.searchResults[this.selectedIndex].id);
                this.queryString = '';
            }
        }
        if (event && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            this.$emit('close');
        }
    }

    updateNewMulti(id: string, event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.queryString = '';
        this.localValue.push(id);
        this.$emit('change', [...this.localValue]);
        // this.$emit('close');
        this.$refs.search?.focus({
            preventScroll: true,
        });
    }

    updateMulti(id: string) {
        if (this.localValue.includes(id)) {
            this.localValue = this.localValue.filter(
                (val: string) => val !== id,
            );
        } else {
            this.localValue.push(id);
        }

        this.$emit('change', [...this.localValue]);
    }

    updateSingle(id: string) {
        this.$emit('change', id);
        if (this.closeOnUpdate) this.$emit('close');
    }

    focusSelected() {
        const selected = this.items.find((item: any) => {
            if (this.focusElementOnMounted) {
                return item.id === this.focusElementOnMounted;
            }
            return (
                (this.multi && this.localValue.includes(item.id)) ||
                (!this.multi && item.id === this.localValue)
            );
        });

        if (selected && selected.id) {
            this.selectedIndex = this.sortedResults.indexOf(selected);
            const el = document?.getElementById(
                this.searchResults[this.selectedIndex].id,
            );

            if (el) {
                scrollIntoView(el, {
                    time: 50,
                });
            }
        }
    }

    beforeMount() {
        if (this.multi) {
            this.localValue = [...this.value];
            return;
        }
        this.localValue = this.value;
    }

    onEvent(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            this.handleEscKey(e);
        } else if (e.key === 'ArrowUp') {
            this.handleUpKey();
        } else if (e.key === 'ArrowDown') {
            this.handleDownKey();
        } else if (e.key === 'Enter') {
            this.handleEnterKey(e);
        }
    }

    clearSelect() {
        if (this.multi) {
            this.localValue = [];
            this.$emit('change', [...this.localValue]);
            return;
        }
        this.$emit('change', null);
        if (this.closeOnUpdate) this.$emit('close');
    }

    registerKeyboardListeners() {
        window.addEventListener('keydown', this.onEvent);
    }

    beforeDestroy() {
        window.removeEventListener('keydown', this.onEvent);
    }

    mounted() {
        this.sortResults();
        this.$nextTick(() => {
            this.focusSelected();
            if (this.search) {
                this.$refs.search?.focus({
                    preventScroll: true,
                });
            }
        });

        if (this.search) return;
        this.registerKeyboardListeners();
    }
}
</script>

<style lang="scss" scoped>
.a-dropdown {
    &.styled {
        @include frostedGlassBackground;
    }

    border-radius: 8px;
    padding: 4px;
    width: 100%;

    &__header {
        border-bottom: 1px solid var(--context-menu-divider-color);
        margin-bottom: 4px;

        input {
            @include inputMetaStyles;
            @include font12-500;
            display: block;
            padding: 4px 10px 4px 8px;
            color: var(--a-dropdown-text-search-text-color);
            line-height: 24px;
            font-weight: 500;
            border-radius: 6px;
            outline: none;
            width: 100%;

            &::placeholder {
                color: var(--a-dropdown-text-search-placeholder-color);
            }
        }
    }

    &__body {
        @include scrollbarLight;
        overflow-y: auto;
        max-height: 300px;

        &__no-results {
            @include font12-500;
            user-select: none;
            color: var(--a-dropdown-no-results-text-color);
            padding: 5px 8px 5px 8px;
        }

        &__value {
            @include font12-500;
            //padding: 5px 8px 5px 9px;
            border-radius: 6px;
            display: flex;
            width: 100%;
            align-items: center;
            color: var(--a-dropdown-text-default-color);

            &__has-img {
                //padding: 5px 8px 5px 9px;
            }

            &__add {
                padding: 2px;
                margin-right: 5px;
            }

            &__check {
                margin-right: 5px;
            }

            &__check-start {
                padding-left: 32px;
                //padding: 5px 8px 5px 32px;

                .a-dropdown__body__value__icon {
                    margin-right: 9px;
                }
            }

            &__check-end {
                padding-right: 5px;

                .a-dropdown__body__value__icon {
                    margin-left: 9px;
                }
            }

            &__text-wrapper {
                display: flex;
                align-items: center;
                width: 100%;
                justify-content: flex-start;
                user-select: none;
                cursor: default;
                overflow: hidden;
                font-variant: tabular-nums;
                padding: 5px 5px 5px 5px;

                span {
                    @include ellipsis;
                }
            }

            &--multi {
                padding: 0;
                //padding: 5px 0 5px 5px;
            }

            &:hover {
                color: var(--a-dropdown-text-highlight-color);
            }

            &__icon {
                flex-shrink: 0;
            }

            &__selected {
                color: var(--a-dropdown-text-highlight-color);
                padding-left: 9px;

                &.a-dropdown__body__value--multi {
                    padding-left: 0;
                }

                &.a-dropdown__body__value__check-end {
                    padding-left: 0;
                }
            }

            &__highlighted {
                background: var(--a-dropdown-button-highlight-bg);
                border-radius: 6px;
            }
        }
    }

    &__clear {
        @include font12-500;
        margin-top: 8px;
        display: flex;
        width: 100%;
        padding: 4px 8px;
        border-radius: 4px;
        align-items: center;
        justify-content: center;
        background: var(--a-dropdown-clear-bg-color);
        color: var(--a-dropdown-clear-text-color);

        &:hover {
            background: var(--a-dropdown-clear-bg-color__hover);
            color: var(--a-dropdown-clear-text-color__hover);
        }
    }
}
</style>
