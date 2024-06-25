<template>
    <span class="key">
        <slot/>
    </span>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'Key',
    components: {},
    props: {},
    data() {
        return {};
    },

});
</script>

<style lang="scss">
.key {
    color: $blueGrey50;
    height: 16px;
    background: $blueGrey700;
    border-radius: 3px;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 2px;
}
</style>
