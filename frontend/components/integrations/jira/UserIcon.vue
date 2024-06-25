<template>
    <div class="issue-assignee">
        <img
            v-if="assigneeImgUrl"
            :src="assigneeImgUrl"
            :alt="assigneeDisplayName"
            :style="{ width: `${size}px`, height: `${size}px` }"
        />
        <InterfaceUserCircle
            v-else
            class="issue-assignee__placeholder"
            :size="size"
        >
        </InterfaceUserCircle>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';

@Component({
    name: 'UserIcon',
    components: { InterfaceUserCircle },
})
export default class UserIcon extends Vue {
    @Prop({ required: true })
    user!: any;

    @Prop({ default: '18' })
    size!: string;

    get assigneeDisplayName() {
        return this.user?.displayName;
    }

    get assigneeImgUrl() {
        return this.user?.avatarUrls?.['48x48'];
    }
}
</script>
<style lang="scss" scoped>
.issue-assignee {
    flex-shrink: 0;

    img {
        border-radius: 50%;
        display: block;
    }
}
</style>
