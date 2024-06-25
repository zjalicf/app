<template>
    <div class="toggle-slider">
        <div class="switch" :class="{ disabled }">
            <input
                :id="id"
                :disabled="disabled"
                :value="value"
                type="checkbox"
                :class="[value ? 'toggled' : null]"
                @click="setNewToggleState"
            />
            <span class="track">
                <span class="handle"></span>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class CSwitch extends Vue {
    @Prop({
        default: false,
    })
    value!: boolean;

    @Prop()
    id!: string;

    @Prop({
        default: false,
    })
    disabled!: boolean;

    setNewToggleState = () => {
        if (this.disabled) return;
        this.$emit('input', !this.value);
    };
}
</script>

<style lang="scss" scoped>
.toggle-slider {
    padding: 2px 0px;
    display: inline-block;
    height: 22px;
}

.switch {
    position: relative;
    display: inline-block;
    width: 31px;
    height: 18px;

    input {
        display: none;
    }

    .track {
        display: flex;
        align-items: center;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        right: 0;
        bottom: 0;
        background: var(--c-switch-bg-color);
        border-radius: 42px;
        transition: 0.15s;

        .handle {
            display: flex;
            width: 20px;
            height: 20px;
            background-color: var(--c-switch-handle-bg-color);
            border-radius: 50%;
            transition: 0.15s;
            transform: translateX(-1px);
            box-shadow: var(--c-switch-box-shadow);
        }
    }

    input.toggled + .track {
        background-color: var(--accent-color);
    }

    input.toggled + .track > .handle {
        transform: translateX(12px);
    }
}
</style>
