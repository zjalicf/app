<template>
    <div class="select-dropdown">
        <button @click="onSelect(CaptureTypes.MY_DAY)">
            <span>
                <Star/>My Day
            </span>
            <span class="select-tooltip">{{ cmdOrCtrl }}+1</span>

        </button>
        <button @click="onSelect(CaptureTypes.PAGE)">
            <span>
                <Plus/>New Page
            </span>
            <span class="select-tooltip">{{ cmdOrCtrl }}+2</span>
        </button>
    </div>
</template>

<script>
import Vue from 'vue';
import {CaptureTypes} from "~/constants";
import Star from "~/components/icons/Star.vue";
import Plus from "~/components/icons/Plus.vue";

export default Vue.extend({
    name: 'SelectDropdown',
    components: {Plus, Star},
    props: {isMac: {type: Boolean, default: false}},
    data() {
        return {};
    },
    computed: {
        CaptureTypes() {
            return CaptureTypes
        },
        cmdOrCtrl() {
            if (this.isMac) {
                return '⌘'
            }
            return 'Ctrl'
        },
    },
    methods: {
        onSelect(type) {
            this.$emit('update-type', type);
        }
    }
});
</script>

<style lang="scss">
.select-dropdown {
    @include frostedGlassBackground;
    @include noDrag;
    min-width: 200px;
    padding: 5px;
    border-radius: 8px;
    position: absolute;
    bottom: 32px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    button {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 5px 8px;
        border-radius: 6px;

        font-size: 12.37px;
        font-style: normal;
        font-weight: 400;
        line-height: 18px;
        letter-spacing: -0.124px;

        color: $blueGrey300;

        &:hover {
            background: $blueGrey300-13;
            color: $white;
        }

        span {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 8px;
        }
    }

    &--keys {
        min-width: 53px;
        display: flex;
        align-items: center;
    }
}
</style>
