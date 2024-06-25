<template>
    <div class="a-color-picker">
        <div
            v-for="color in displayColors"
            :key="color.id"
            class="a-color-picker__color__wrapper"
            :class="{ selected: color.id === value }"
        >
            <button
                v-if="color.id === 'clear'"
                class="a-color-picker__clear"
                @click="onClearHandler"
            >
                <MinusIcon class="icon" size="20" />
            </button>
            <button
                v-else
                class="a-color-picker__color"
                :style="{ background: color.color }"
                @click="onSelectHandler(color.id)"
            ></button>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { MinusIcon } from '@vue-hero-icons/solid';
import { Color, ColorTuple } from '~/constants';
import { ThemeOptions } from '~/helpers/date';

@Component({
    name: 'AColorPicker',
    components: {
        MinusIcon,
    },
})
export default class AColorPicker extends Vue {
    @Prop({
        required: false,
        default: () => null,
    })
    colors!: Record<Color, ColorTuple>;

    @Prop({
        required: false,
        default: () => null,
    })
    colorsOld!: { id: string; color: string }[];

    @Prop({
        required: true,
    })
    value!: string;

    @Prop({
        default: false,
    })
    includeClear!: boolean;

    get displayColors() {
        if (this.colorsOld) return this.colorsOld;
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.$store.getters['appSettings/theme'];

        const colors = (Object.keys(this.colors) as Color[]).map(key => {
            return {
                id: key,
                color: this.colors[key][theme].COLOR,
            };
        });

        if (this.includeClear) {
            return [{ id: 'clear', color: 'clear' }, ...colors.slice(1)];
        }
        return colors;
    }

    onSelectHandler(color: Color | string) {
        this.$emit('select', color);
        this.$emit('close');
    }

    onClearHandler() {
        this.$emit('clear');
        this.$emit('close');
    }
}
</script>

<style lang="scss" scoped>
.a-color-picker {
    @include frostedGlassBackground;
    padding: 8px;
    border-radius: 12px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;

    &__color__wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        &.selected {
            border: 1px solid var(--accent-color);
        }
    }

    &__clear {
        border: 1px solid var(--a-color-picker-clear-text);
    }

    button {
        display: block;
        outline: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;

        .icon {
            position: relative;
            right: 3px;
            bottom: 3px;
            color: var(--a-color-picker-clear-text);
            -ms-transform: rotate(-45deg); /* IE 9 */
            transform: rotate(-45deg);
        }
    }
}
</style>
