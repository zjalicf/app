<template>
    <div class="success-page">
        <div class="success-page__container">
            <div class="success-page__image">
                <img :src="image" />
            </div>
            <div class="success-page__title">
                {{ resolvedType }} authorised. Return to acreom to finish
                integration.
            </div>
            <div class="success-page__action">
                <button
                    class="success-page__action__button"
                    @click="openAcreom"
                >
                    Open acreom
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'Success',
    components: {},
    layout: 'homepage',
    asyncData(route) {
        // type === jira or gcal
        const { type, error } = route.query;
        return { type, error };
    },
})
export default class Success extends Vue {
    type!: string;
    error!: string;

    timedOut: boolean = false;
    opened: boolean = false;
    opening: boolean = false;

    get image() {
        const knownType = ['jira', 'gcal'].includes(this.type)
            ? this.type
            : 'fallback';
        return `/integrations/${knownType}.png`;
    }

    get resolvedType() {
        if (this.type === 'jira') {
            return 'Jira account';
        }
        if (this.type === 'gcal') {
            return 'Google Calendar account';
        }
        return 'Integration';
    }

    openAcreom() {
        window.location.replace('acreom://integration-success');
    }

    mounted() {
        try {
            this.openAcreom();
            window.addEventListener('beforeunload', function () {
                window.opener.postMessage('popupClosed', '*');
            });

            window.opener.postMessage('integration-success', '*');
        } catch (e) {
            console.log(e);
        }
    }
}
</script>

<style lang="scss" scoped>
.success-page {
    height: 100vh;
    width: 100%;
    background: $black;

    &__container {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    &__image {
        margin: 0 auto 25px;
    }

    &__title {
        @include font14-500;
        color: $white;
        max-width: 255px;
        text-align: center;
        margin-bottom: 22px;
    }

    &__action {
        max-width: 180px;
        width: 100%;

        &__button {
            @include font12-600;
            color: black;
            padding: 9px 0;
            text-align: center;
            background: $white;
            border-radius: 6px;
            width: 100%;
        }
    }
}
</style>
