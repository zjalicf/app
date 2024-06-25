<template>
    <div class="color-picker-pane">
        <div class="color-picker-pane__colors-wrapper">
            <div
                v-for="color in displayColors"
                :key="color.id"
                class="color-picker-pane__colors-wrapper__colors"
                :class="{ selected: color.id === value }"
            >
                <button
                    v-if="color.id === 'clear'"
                    class="color-picker-pane__colors-wrapper__colors__clear"
                    @click="onClearHandler"
                >
                    <MinusIcon class="icon" size="20" />
                </button>
                <button
                    v-else
                    class="color-picker-pane__colors-wrapper__colors__color"
                    :style="{ background: color.color }"
                    @click="onSelectHandler(color.id)"
                ></button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { MinusIcon } from '@vue-hero-icons/solid';
import { ThemeOptions } from '~/helpers/date';
import { Color, ColorTuple } from '~/constants';

@Component({
    name: 'ColorPickerPane',
    components: { MinusIcon },
})
export default class ColorPickerPane extends Vue {
    @Prop({
        default: false,
    })
    includeClear!: boolean;

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
    }

    onClearHandler() {
        this.$emit('clear');
    }
}
</script>
<style lang="scss" scoped>
.color-picker-pane {
    padding: 4px 24px 30px;
    user-select: none;

    &__colors-wrapper {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        justify-items: center;
        gap: 10px;

        &__colors {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            width: 56px;
            height: 56px;
            border-radius: 50%;

            &.selected {
                border: 2px solid var(--accent-color);
            }
            &__clear {
                border: 2px solid var(--a-color-picker-clear-text);
            }
            button {
                display: block;
                outline: none;
                width: 44px;
                height: 44px;
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
    }
}
</style>
