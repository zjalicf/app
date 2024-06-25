<template>
    <div class="mobile-page-status">
        <div class="mobile-page-status__title">
            <InterfaceEditSelectAreaCircleDash class="icon" size="16" />
            Status
        </div>
        <div class="mobile-page-status__options">
            <button
                v-for="status in statuses"
                :key="status.id"
                class="mobile-page-status__options__option"
                @click="onSelect(status.id)"
            >
                <component
                    :is="status.icon.icon"
                    class="icon"
                    :style="{ color: status.icon.color }"
                    size="16"
                />
                <div class="mobile-page-status__options__option__title">
                    <p>{{ status.label }}</p>
                </div>
                <div
                    v-if="selectedStatus === status.id"
                    class="mobile-page-status__options__option__icon"
                >
                    <InterfaceValidationCheck size="16" />
                </div>
            </button>
        </div>
        <div class="mobile-page-status__options">
            <button
                class="mobile-page-status__options__option danger"
                @click="onSelect(null)"
            >
                <InterfaceDeleteSquare class="icon" size="16" />
                <div class="mobile-page-status__options__option__title">
                    <p>Clear Status</p>
                </div>
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import { PageStatus } from '~/constants';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import InterfaceDeleteSquare from '~/components/streamline/InterfaceDeleteSquare.vue';

@Component({
    name: 'MobilePageStatusDropdown',
    components: {
        InterfaceDeleteSquare,
        InterfaceEditSelectAreaCircleDash,
        InterfaceValidationCheck,
    },
})
export default class MobilePageStatusDropdown extends Vue {
    @Prop({
        required: true,
    })
    statuses!: any[];

    @Prop({
        required: true,
    })
    selectedStatus!: PageStatus;

    onSelect(status: any) {
        this.$emit('select', status);
    }
}
</script>
<style lang="scss" scoped>
.mobile-page-status {
    padding: 0 16px 30px;

    &__title {
        @include ellipsis;
        margin-top: 7px;
        text-align: left;
        font-weight: 600;
        font-size: 16px;
        line-height: 19px;
        letter-spacing: -0.24px;
        color: $white;
        margin-bottom: 25px;
        display: flex;

        .icon {
            color: $blueGrey500;
            margin-right: 12px;
            flex-shrink: 0;
        }
    }

    &__options {
        border-radius: 12px;
        margin-bottom: 16px;

        &__option {
            @include paneButtons;
            outline: none;
            display: grid;
            grid-template-columns: 20px minmax(0, 1fr) 16px;
            gap: 16px;
            align-items: center;
            text-align: left;
            width: 100%;
            padding: 16px;

            &:first-of-type {
                border-top-right-radius: 12px;
                border-top-left-radius: 12px;
            }

            &:last-of-type {
                border-bottom-right-radius: 12px;
                border-bottom-left-radius: 12px;
            }

            &__title {
                @include ellipsis;
                font-weight: 500;
                font-size: 16px;
                line-height: 19px;
            }

            &__icon {
                color: $blueGrey300;
            }
        }
    }
}
</style>
