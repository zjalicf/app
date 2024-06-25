<template functional>
    <div class="read-only-editor">
        <component :is="injections.components.RenderHtml" :html="props.value" />
    </div>
</template>

<script lang="ts">
import RenderHtml from '@/components/util/RenderHtml.vue';

export default {
    inject: {
        components: {
            default: {
                RenderHtml,
            },
        },
    },
    props: ['value'],
};
</script>
