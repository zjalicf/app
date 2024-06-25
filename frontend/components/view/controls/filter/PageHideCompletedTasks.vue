<template>
    <label class="page-hide-completed-tasks">
        Hide Completed Tasks
        <div class="page-hide-completed-tasks__toggle">
            <CSwitch
                id="hide-completed-tasks"
                :value="value"
                @input="updateHideCompletedTasks"
            />
        </div>
    </label>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import CSwitch from '~/components/CSwitch.vue';

@Component({
    name: 'PageHideCompletedTasks',
    components: {
        CSwitch,
    },
})
export default class PageHideCompletedTasks extends Vue {
    @Prop({})
    viewOptions!: any;

    get value() {
        return this.viewOptions.hideCompletedTasks ?? false;
    }

    updateHideCompletedTasks(value: boolean) {
        this.$emit('update', { hideCompletedTasks: value });
    }
}
</script>
<style lang="scss" scoped>
.page-hide-completed-tasks {
    @include font12-500;
    outline: none;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--dropdown-controls-text-color);
}
</style>
