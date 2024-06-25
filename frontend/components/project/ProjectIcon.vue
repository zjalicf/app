<template>
    <div class="view-icon" :style="{ width: `${size}px`, height: `${size}px` }">
        <span v-if="hasCustomIcon" :style="{ fontSize: `${fontSize}px` }">
            {{ $entities.project.getIcon(project.id) }}
        </span>
        <InterfaceDashboardLayoutSquare v-else class="icon" :size="size" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceDashboardLayoutSquare from '~/components/streamline/InterfaceDashboardLayoutSquare.vue';

@Component({
    name: 'ProjectIcon',
    components: { InterfaceDashboardLayoutSquare },
})
export default class ProjectIcon extends Vue {
    @Prop({ required: true })
    id!: string;

    @Prop({ default: '14' })
    size!: string;

    @Prop({ default: '18' })
    fontSize!: string;

    get project() {
        return this.$entities.project.byId(this.id);
    }

    get hasCustomIcon() {
        return !!this.project?.icon;
    }
}
</script>
<style scoped lang="scss">
.view-icon {
    width: 14px;
    height: 14px;
    position: relative;

    span {
        position: absolute;
        font-size: 18px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        text-align: center;
        text-align: -webkit-center;
        font-family: 'Apple Color Emoji', 'Segoe UI Emoji', NotoColorEmoji,
            'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji', EmojiSymbols,
            serif;
    }
}
</style>
