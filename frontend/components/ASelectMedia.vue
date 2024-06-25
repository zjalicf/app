<template>
    <div
        class="a-select-media"
        :class="{ tiny }"
        :style="{ width: `${size}px`, height: `${size}px` }"
    >
        <img v-if="value.img" :src="value.img" :alt="value.alt" />
        <component
            :is="value.icon"
            v-if="value.icon"
            v-bind="value.bind"
            :style="iconStyle"
            :size="value.size"
            class="a-select-media--icon"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AsyncComponent, Component as ComponentType } from 'vue';

@Component({
    name: 'ASelectMedia',
    components: {},
})
export default class ASelectMedia extends Vue {
    @Prop({ default: null })
    value!: {
        img: string;
        bind?: Record<string, any>;
        size: number;
        color: string;
        icon?: ComponentType | AsyncComponent;
    };

    @Prop({ default: 18 })
    size!: number;

    @Prop({ default: false })
    tiny!: boolean;

    get iconStyle() {
        if (this.value.color) {
            return { color: this.value.color };
        }
        return null;
    }
}
</script>
<style lang="scss" scoped>
.a-select-media {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    margin-right: 6px;
    flex-shrink: 0;

    &.tiny {
        margin: 0;
    }

    img {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 50%;
    }

    &--icon {
    }
}
</style>
