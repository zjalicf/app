<template>
    <div class="header">
        <div class="header--actions">
            <button class="header--select" @click="showTypeDropdown">
                <Star v-if="headerData.type === CaptureTypes.MY_DAY"/>
                <Plus v-else/>
                {{ displayString }}
            </button>
            <SelectDropdown :is-mac="isMac" v-if="showDropdown" @update-type="onSelect($event)"/>
        </div>
        <div v-if="showDropdown" @click="hideDropdown" class="header--backdrop"></div>
    </div>
</template>

<script>
import Vue from 'vue';
import ChevronLeft from "~/components/icons/ChevronLeft.vue";
import {CaptureTypes} from "~/constants";
import AcreomChevronDown from "~/components/icons/AcreomChevronDown.vue";
import Star from "~/components/icons/Star.vue";
import Plus from "~/components/icons/Plus.vue";

export default Vue.extend({
    name: 'Header',
    components: {
        Plus,
        Star,
        AcreomChevronDown,
        ChevronLeft
    },
    props: {
        headerData: {
            type: Object,
            default: () => ({
                type: CaptureTypes.MY_DAY,
                isEmpty: true
            })
        },
        isMac: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showDropdown: false,
        };
    },
    computed: {
        CaptureTypes() {
            return CaptureTypes;
        },
        type() {
            return this.headerData.type;
        },
        displayString() {
            return `${this.type.split('_').join(' ')}`;
        },
        isEmpty() {
            return this.headerData.isEmpty;
        },
    },
    methods: {
        showTypeDropdown() {
            this.showDropdown = true;
            this.$emit('select:show');
        },
        hideDropdown() {
            this.showDropdown = false;
            this.$emit('select:hide');
            this.$nuxt.$emit('editor:focus');
        },
        onSelect(type) {
            this.hideDropdown();
            this.$emit('update-type', type);
        }
    }
});
</script>

<style lang="scss">

.header {
    width: 100%;
    z-index: 100;
    cursor: default;

    &--actions {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    &--select {
        @include noDrag;
        padding: 5px 8px;
        border-radius: 6px;
        color: $blueGrey400;

        background: $blueGrey500-16;

        display: flex;
        align-items: center;
        gap: 8px;

        text-transform: capitalize;

        font-size: 12.37px;
        font-style: normal;
        font-weight: 400;
        line-height: 18px;
        letter-spacing: -0.124px;

        .icon {
            color: $blueGrey400;
        }

        &:hover {
            color: $white;
            background: $blueGrey500-32;

            .icon {
                color: $white;
            }
        }
    }

    &--backdrop {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
}
</style>
