<template>
    <div class="c-icon-switch">
        <div ref="background" class="c-icon-switch--background"></div>
        <div class="c-icon-switch--button--group">
            <button
                v-for="option in options"
                :key="option.id"
                class="c-icon-switch--button"
                :class="{
                    'has-icon': option.icon,
                    'has-label': option.label,
                    selected: option.id === value,
                }"
                tabindex="-1"
                @click="handleSelect(option.id)"
            >
                <component
                    :is="option.icon"
                    v-if="option.icon"
                    size="14"
                    class="icon"
                />
                <span v-if="option.label">{{ option.label }}</span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

interface Option {
    icon: any;
    id: string;
    label: string;
}

@Component({
    name: 'CIconSwitch',
})
export default class CIconSwitch extends Vue {
    $refs!: {
        background: HTMLDivElement;
    };

    @Prop()
    options!: Option[];

    @Prop()
    value!: string;

    handleSelect(id: string) {
        this.$emit('change', id);
    }

    @Watch('value', { immediate: true })
    onValueChange(value: string) {
        if (!this.$refs.background) return;
        this.setTranslate(value);
        this.setBackgroundWidth(this.options.length);
    }

    @Watch('options')
    onOptionsChange(value: Option[]) {
        this.setBackgroundWidth(value.length);
    }

    @Watch('showBackground')
    onShowBackgroundChange(value: boolean) {
        if (value) {
            this.setBackgroundWidth(this.options.length);
            this.$refs.background.style.display = 'block';
        } else {
            this.$refs.background.style.display = 'none';
        }
    }

    get showBackground() {
        const ids = this.options.map(({ id }) => id);
        return ids.includes(this.value);
    }

    mounted() {
        this.setBackgroundWidth(this.options.length);
        this.setTranslate(this.value);
        if (!this.showBackground) return;
        this.$refs.background.style.display = 'block';
    }

    setBackgroundWidth(optionLength: number) {
        this.$refs.background.style.width = `${
            Math.round((100 / optionLength) * 1000) / 1000
        }%`;
    }

    setTranslate(value: string) {
        const index = this.options.findIndex(({ id }) => id === value);
        this.$refs.background.style.transform = `translateX(${100 * index}%)`;
    }
}
</script>

<style lang="scss" scoped>
.c-icon-switch {
    position: relative;
    display: flex;
    user-select: none;

    &--background {
        display: none;
        position: absolute;
        background: var(--c-icon-switch-bg-color);
        left: 0;
        height: 100%;
        border-radius: 6px;
        transform: translateX(0%);
        transition: transform 0.15s;
        box-shadow: var(
            --dropdown-controls-display-as-switch-box-shadow__hover
        );
    }

    &--button {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        outline: none;
        color: var(--c-icon-switch-button-text-color);

        span {
            font-weight: 600;
            font-size: 12px;
            line-height: 18px;
        }

        &--group {
            width: 100%;
            display: flex;
            align-items: center;
            border-radius: 6px;
            background: var(--c-icon-switch-button-bg-color);
        }

        &:hover {
            color: var(--c-icon-switch-button-text-color__hover);
        }

        &.selected {
            color: var(--c-icon-switch-button-text-color__hover);
        }

        &.has-icon.has-label {
            padding: 4px 10px;
        }

        &.has-icon:not(.has-label) {
            padding: 4px 10px;
        }

        &.has-label:not(.has-icon) {
            padding: 2px 0px;
        }
    }
}
</style>
