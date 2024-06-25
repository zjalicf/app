<template>
    <div class="github-label">
        <span
            :style="{ background: `#${label.color}` }"
            class="github-label__dot"
        ></span>
        {{ label.name }}
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubLabel as GithubLabelType } from '~/components/github/github';

@Component({
    name: 'GithubLabel',
})
export default class GithubLabel extends Vue {
    @Prop({ required: true })
    label!: GithubLabelType;
}
</script>
<style lang="scss" scoped>
.github-label {
    @include font12-500;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;

    &__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
}
</style>
