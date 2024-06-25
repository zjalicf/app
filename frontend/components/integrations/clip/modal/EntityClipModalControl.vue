<template>
    <div class="entity-clip-modal-control">
        <div class="entity-clip-modal-control__title">
            <slot name="title" />
        </div>
        <div class="entity-clip-modal-control__controls">
            <slot name="controls" />
        </div>
        <div class="entity-clip-modal-control__error">
            <slot name="error" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';

@Component({
    name: 'EntityClipModalContent',
    components: {
        ASelect,
    },
})
export default class EntityClipModalContent extends Vue {}
</script>
<style lang="scss" scoped>
.entity-clip-modal-control {
    padding: 16px 16px 0;
    &__title {
        @include font12-500;
        color: var(--modal-body-text-color);
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: flex-start;
    }
    &__controls {
        margin-top: 8px;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 4px;

        :deep(.c-input) {
            width: 100%;
            input {
                background: var(--c-input-bg-color__hover);
            }
        }

        .icon {
            flex-shrink: 0;
        }
    }
    &__error {
        @include font12-400;
        color: var(--danger-color);
        margin-top: 4px;
    }
}
</style>
