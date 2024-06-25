<template>
    <div class="items">
        <span class="items--title">label</span>
        <template v-if="items.length">
            <button
                class="item"
                :class="{ 'is-selected': index === selectedIndex }"
                v-for="(item, index) in items"
                :key="index"
                @click="selectItem(index)"
            >
                {{ item }}
            </button>
        </template>
        <div class="item" v-else>
            No result
        </div>
    </div>
</template>

<script>
export default {
    props: {
        items: {
            type: Array,
            required: true,
        },

        command: {
            type: Function,
            required: true,
        },
    },

    data() {
        return {
            selectedIndex: 0,
        }
    },

    watch: {
        items() {
            this.selectedIndex = 0
        },
    },

    methods: {
        onKeyDown({event}) {
            if (event.key === 'ArrowUp') {
                this.upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                this.downHandler()
                return true
            }

            if (event.key === 'Enter') {
                this.enterHandler()
                return true
            }

            return false
        },

        upHandler() {
            this.selectedIndex = ((this.selectedIndex + this.items.length) - 1) % this.items.length
        },

        downHandler() {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length
        },

        enterHandler() {
            this.selectItem(this.selectedIndex)
        },

        selectItem(index) {
            const item = this.items[index]

            if (item) {
                this.command({id: item})
            }
        },
    },
}
</script>

<style lang="scss">
.items {
    @include frostedGlassBackground;
    position: relative;
    overflow: hidden;
    padding: 5px;
    border-radius: 8px;

    user-select: none;

    &--title {
        text-transform: uppercase;
        font-style: normal;
        font-weight: 700;
        font-size: 0.714rem;
        line-height: 16px;
        letter-spacing: 0.03em;
        color: $blueGrey500;
        padding: 0 4px 4px;
    }
}

.item {
    display: block;
    margin: 0;
    width: 100%;
    text-align: left;
    border-radius: 6px;
    background: $blueGrey100-10;
    padding: 5px 8px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
