<template>
    <label class="mobile-dropdown__control" :for="forElement">
        <slot></slot>
    </label>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'MobileOverviewHeader',
    components: {},
})
export default class MobileOverviewHeader extends Vue {
    @Prop({ required: true })
    forElement!: string;
}
</script>
