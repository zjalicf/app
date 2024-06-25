<template>
    <input
        :id="id"
        type="checkbox"
        class="a-check"
        :value="value"
        :checked="value"
        tabindex="-1"
        @change="onChangeHandler"
    />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
    name: 'ACheck',
})
export default class ACheck extends Vue {
    @Prop({ required: true })
    value!: boolean;

    @Prop()
    id!: string;

    onChangeHandler(event: any) {
        this.$emit('change', event.target.checked);
    }
}
</script>

<style lang="scss" scoped>
.a-check {
    &:checked:after {
        background-color: var(--a-check-icon-color);
    }

    flex-shrink: 0;
    appearance: none;
    display: block;
    background: none;
    border-radius: 5px;
    border: 1px solid var(--a-check-default-bg-color);
    width: 18px;
    height: 18px;

    &:checked {
        background: var(--a-check-checked-bg-color);
        border-color: var(--a-check-checked-bg-color);
        position: relative;

        &:after {
            position: absolute;
            left: -1px;
            top: -1px;
            display: block;
            content: '';
            mask-image: url('/components/system/ACheck/check.svg');
            mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-image: url('/components/system/ACheck/check.svg');
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
            width: 18px;
            height: 18px;
        }
    }
}
</style>
