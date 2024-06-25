<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :styles="{
            paddingTop: `30px`,
            paddingBottom: `30px`,
        }"
        :content-style="{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div class="issue-properties-modal">
            <IssueProperties
                v-if="entity.id"
                :entity-id-prop="entity.id"
                :detached="true"
                @close="close()"
            />
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import IssueProperties from '~/components/entities/jira/JiraPanel.vue';
import { GithubSymbols } from '~/components/github/github';

@Component({
    name: 'JiraPropertiesModal',
    components: { IssueProperties },
})
export default class JiraPropertiesModal extends Vue {
    @Prop({ required: true })
    entity!: any;

    @Provide(GithubSymbols.VIEW_CONTEXT)
    viewContext: string = 'modal';
}
</script>

<style scoped lang="scss">
.issue-properties-modal {
    @include scrollbar(69px, 10px);
    @include modal;
    overflow-y: auto;
    max-height: calc(100vh - 60px);
}
</style>
