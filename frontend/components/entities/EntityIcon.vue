<template>
    <div class="entity-icon">
        <component :is="iconComponent" :size="28" />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PageHeaderControls from '~/components/tabs/scroll-headers/PageHeaderControls.vue';

@Component({
    name: 'EntityIcon',
    components: {},
})
export default class EntityIcon extends Vue {
    get iconComponent() {
        return PageHeaderControls;
    }
}
</script>
<style lang="scss" scoped>
.entity-icon {
    margin: 0 auto;
    padding: 0 30px 15px;

    .narrow-editor & {
        max-width: 570px;
    }
}
</style>
