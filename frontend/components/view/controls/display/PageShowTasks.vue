<template>
    <label class="page-show-tasks">
        Show Tasks
        <div class="page-show-tasks__toggle">
            <CSwitch id="show-tasks" :value="value" @input="updateShowTasks" />
        </div>
    </label>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import CSwitch from '~/components/CSwitch.vue';

@Component({
    name: 'PageShowTasks',
    components: {
        CSwitch,
    },
})
export default class PageShowTasks extends Vue {
    @Prop({})
    viewOptions!: any;

    get value() {
        return this.viewOptions.showTasks ?? false;
    }

    updateShowTasks(value: boolean) {
        this.$emit('update', { showTasks: value });
    }
}
</script>
<style lang="scss" scoped>
.page-show-tasks {
    @include font12-500;
    outline: none;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--dropdown-controls-text-color);
}
</style>
