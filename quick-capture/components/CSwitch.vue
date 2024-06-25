<template>
    <div class="toggle-slider">
        <div class="switch">
            <input
                :id="id"
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

import Vue from "vue";

export default Vue.extend({
    name: 'CSwitch',
    components: {},
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        id: {
            type: String,
            required: true,
        },
    },
    data() {
        return {};
    },
    computed: {},
    methods: {
        setNewToggleState() {
            this.$emit('input', !this.value);
        }
    }
});
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
        background-color: $blueGrey700;
        border-radius: 42px;
        transition: 0.15s;

        .handle {
            display: flex;
            width: 20px;
            height: 20px;
            background-color: $white;
            border-radius: 50%;
            transition: 0.15s;
            transform: translateX(0px);
        }
    }

    input.toggled + .track {
        background-color: $turquoise;
    }

    input:focus + .track {
        box-shadow: 0 0 1px black;
    }

    input.toggled + .track > .handle {
        transform: translateX(11px);
    }
}
</style>
