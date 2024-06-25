<template>
    <div class="success-page">
        <div class="success-page--container">
            <div class="success-page--container--content">
                <img alt="error" src="/pages/integrations/icon-error.svg" />
                <div>
                    <h2 class="success-page--container--content--heading">
                        Unable to connect <span>{{ type }}</span
                        >.
                    </h2>
                    <span>Please try again.</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'Error',
    components: {},
    layout: 'homepage',
    asyncData(route) {
        const { type, error } = route.query;
        return { type, error };
    },
})
export default class Error extends Vue {
    type!: string;
    error!: string;
}
</script>

<style lang="scss" scoped>
.back-button {
    @include font12-400;
    color: var(--success-download-text-color);
}

.success-page {
    @include scrollbar;
    font-family: 'Inter', sans-serif;
    user-select: none;

    &--container {
        height: max(300px, calc(100vh - 141px));
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        &--content {
            display: flex;
            flex-direction: column;
            align-items: center;

            #pro-loader {
                width: 144px;
                height: 144px;
            }

            div {
                display: flex;
                align-items: center;
                flex-direction: column;
            }

            &--heading {
                font-weight: 700;
                font-size: 22px;
                line-height: 155.2%;
                color: var(--integration-heading-text-color);
                text-align: center;
                width: 100%;
                margin-bottom: 27px;

                span {
                    text-transform: capitalize;
                }
            }
        }
    }
}
</style>
