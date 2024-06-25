<template>
    <div class="tooltip-keys">
        <div v-for="key in keys" :key="key" class="tooltip-keys--button">
            <div v-if="$config.os === 'mac'">
                <CtrlIcon v-if="key === 'ctrl'" :size="16" />
                <AltIcon v-else-if="key === 'alt'" :size="16" />
                <CommandIcon v-else-if="key === 'cmd'" :size="16" />
                <ShiftIcon v-else-if="key === 'shift'" :size="16" />
                <ArrowDown v-else-if="key === 'arrowdown'" :size="16" />
                <ArrowUp v-else-if="key === 'arrowup'" :size="16" />
                <ArrowLeft v-else-if="key === 'arrowleft'" :size="16" />
                <ArrowRight v-else-if="key === 'arrowright'" :size="16" />
                <Backspace v-else-if="key === 'backspace'" :size="16" />
                <span v-else>{{ titleCase(key) }}</span>
            </div>
            <div v-else>
                <ArrowDown v-if="key === 'arrowdown'" :size="16" />
                <ArrowUp v-else-if="key === 'arrowup'" :size="16" />
                <ArrowLeft v-else-if="key === 'arrowleft'" :size="16" />
                <ArrowRight v-else-if="key === 'arrowright'" :size="16" />
                <span v-else>{{ titleCase(key) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CtrlIcon from '~/components/icons/CtrlIcon.vue';
import AltIcon from '~/components/icons/AltIcon.vue';
import CommandIcon from '~/components/icons/CommandIcon.vue';
import ShiftIcon from '~/components/icons/ShiftIcon.vue';
import ArrowDown from '~/components/icons/ArrowDown.vue';
import ArrowUp from '~/components/icons/ArrowUp.vue';
import ArrowLeft from '~/components/icons/ArrowLeft.vue';
import ArrowRight from '~/components/icons/ArrowRight.vue';
import Backspace from '~/components/icons/Backspace.vue';

@Component({
    name: 'TooltipKeys',
    components: {
        Backspace,
        ArrowRight,
        ArrowLeft,
        ArrowUp,
        ArrowDown,
        ShiftIcon,
        CommandIcon,
        AltIcon,
        CtrlIcon,
    },
})
export default class TooltipKeys extends Vue {
    @Prop({ default: '' })
    keybind!: string | string[];

    get keys() {
        if (Array.isArray(this.keybind) && this.keybind.length) {
            return this.$shortcutsManager.getTooltipKeys(this.keybind[0]);
        }
        return this.$shortcutsManager.getTooltipKeys(this.keybind as string);
    }

    titleCase(key: string): string {
        const capitalizedStr = key.charAt(0).toUpperCase() + key.slice(1);
        const splitArr = capitalizedStr.split(/(?=[A-Z0-9])/);
        return splitArr.join(' ');
    }
}
</script>

<style lang="scss" scoped>
.tooltip-keys {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &--button {
        color: var(--tooltip-keys-text-color);
        background: var(--tooltip-keys-bg-color);
        height: 19px;
        min-width: 19px;
        line-height: 18px;
        border-radius: 3px;
        font-weight: 600;
        font-size: 12px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:not(:last-of-type) {
            margin-right: 4px;
        }
    }
}
</style>
