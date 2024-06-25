<template>
    <div
        class="my-day-panel"
        :class="{
            'tab-content-gutter': !detached,
            detached,
        }"
    >
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[100, 20]"
            :touch="false"
            boundary="window"
            placement="top-end"
            theme="tooltip"
            target=".has-tippy"
        />
        <MyDayPanelHeader
            :detached="detached"
            :current-date="currentDate"
            @close="$emit('close')"
        />
        <MyDayPanelList @month-changed="onMonthChanged" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import MyDayPanelHeader from '~/components/entities/my-day/panel/list/MyDayPanelHeader.vue';
import MyDayPanelList from '~/components/entities/my-day/panel/MyDayPanelList.vue';

@Component({
    name: 'MyDayPanel',
    components: { MyDayPanelList, MyDayPanelHeader },
})
export default class MyDayPanel extends Vue {
    @Prop({ default: false })
    detached!: boolean;

    currentDate = new Date();

    onMonthChanged(date: Date) {
        this.currentDate = date;
    }
}
</script>

<style lang="scss" scoped>
.my-day-panel {
    height: 100%;
    position: relative;
    overflow-y: hidden;
    overflow-x: hidden;
}
</style>
