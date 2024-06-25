<template>
    <button
        class="my-day-panel-page has-tippy"
        :class="{ overdue: pageInPast }"
        :data-tippy-content="`<div class='tooltip'>Open</div>`"
        @click="$emit('entity-click')"
    >
        <MyDayPanelEntity>
            <template #title>
                <DocumentIcon :document="page" />
                <div class="my-day-panel-entity__title__text">
                    {{ page.title || 'Untitled' }}
                </div>
                <MailSendReply class="hover-icon" />
            </template>
            <template #time>
                <span
                    :style="{
                        color: getPageColorOpacity(1),
                    }"
                    >{{ formattedTime.text }}
                    {{ duration ? `(${duration})` : '' }}</span
                >
            </template>
        </MyDayPanelEntity>
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isAfter } from 'date-fns';
import ReviewPage from '~/components/overview/ReviewPage.vue';
import { IDocument } from '~/components/document/model';
import MyDayPanelEntity from '~/components/entities/my-day/panel/list/MyDayPanelEntity.vue';
import InterfaceValidationCheckSquare1 from '~/components/streamline/InterfaceValidationCheckSquare1.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import MailSendReply from '~/components/streamline/MailSendReply.vue';

@Component({
    name: 'MyDayPanelPage',
    components: {
        MailSendReply,
        DocumentIcon,
        InterfaceContentFileAlternate,
        InterfaceValidationCheckSquare1,
        MyDayPanelEntity,
        ReviewPage,
    },
})
export default class MyDayPanelPage extends Vue {
    @Prop({ required: true })
    page!: Partial<IDocument> & {
        startObject: any;
        endObject: any;
    };

    @Prop({ default: () => new Date() })
    now!: Date;

    get duration() {
        return this.$utils.event.getEventDuration({
            start: this.page.startObject,
            end: this.page.endObject,
        });
    }

    get formattedTime() {
        return this.$utils.event.getEventFormattedTime(
            {
                start: this.page.startObject,
                end: this.page.endObject,
            },
            false,
        );
    }

    get pageInPast() {
        return isAfter(this.now, this.$utils.calendar.endDate(this.page));
    }

    getPageColorOpacity(opacity: number) {
        return this.$utils.calendar.getPageColorOpacity(opacity);
    }
}
</script>
<style lang="scss" scoped>
.my-day-panel-page {
    width: 100%;
    padding: 8px 16px;
    margin-bottom: 4px;
    border-radius: 8px;
    background: var(--my-day-panel-entity-background);

    &.overdue {
        opacity: 0.4;
    }

    &:hover {
        background: var(--my-day-panel-entity-background__hover);

        .hover-icon {
            display: block;
        }
    }
}
</style>
