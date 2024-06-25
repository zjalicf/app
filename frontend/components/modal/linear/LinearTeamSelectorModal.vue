<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="!initial"
        :click-to-close="!initial"
        overlay-transition="fade"
        :content-style="{}"
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
        <div class="linear-modal">
            <div class="linear-modal--header">
                <div class="linear-modal--title">Sync Linear Teams</div>
                <div class="linear-modal--subtitle">
                    Select which Linear teams should be synced with acreom.
                    Linear integration will only sync issues assigned to you.
                </div>
            </div>
            <div
                v-if="linearTeamsItems.length === 0"
                class="linear-modal--body--loader"
            >
                <LoadingIcon :size="16" /> Loading linear teams
            </div>
            <div v-else class="linear-modal--body">
                <ADropDown
                    :items="linearTeamsItems"
                    :value="selectedTeams"
                    :multi="true"
                    :styled="false"
                    :search="true"
                    search-placeholder="Select Teams"
                    width="368"
                    @change="updateSelectedProjects"
                />
            </div>

            <div class="linear-modal--footer">
                <div class="linear-modal--footer--info"></div>
                <div class="linear-modal--footer--actions">
                    <CButton
                        tabindex="0"
                        :disabled="selectedTeams.length === 0"
                        @click="handleLinearTeamSelect(close)"
                        >Save
                    </CButton>
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="handleCancel(close)"
                        >Cancel
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CButton from '@/components/CButton.vue';
import CInput from '~/components/CInput.vue';
import ADropDown from '~/components/ADropDown.vue';
import { TabType } from '~/constants';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';

@Component({
    name: 'LinearTeamSelectorModal',
    components: {
        LoadingIcon,
        ADropDown,
        CInput,
        CButton,
    },
})
export default class LinearTeamSelectorModal extends Vue {
    @Prop({ default: false })
    initial!: boolean;

    @Prop({ default: false })
    openTab!: boolean;

    selectedTeams: string[] = [];

    get linearTeams() {
        return this.$entities.linear.teams;
    }

    get linearTeamsItems() {
        return this.linearTeams.map((team: any) => {
            return {
                id: team.id,
                label: team.name,
            };
        });
    }

    updateSelectedProjects(value: string[]) {
        this.selectedTeams = value;
    }

    get linearIntegration() {
        return this.$entities.linear.getIntegration();
    }

    async handleCancel(close: any) {
        if (this.initial) {
            await this.$entities.linear.deleteIntegration();
        }
        this.$emit('close');
        close();
    }

    async handleLinearTeamSelect(close: any) {
        if (this.selectedTeams.length === 0) {
            return this.handleCancel(close);
        }
        const views = this.$entities.linear.updateDefaultView(
            this.selectedTeams,
        );

        await this.$store.dispatch('integration/update', {
            ...this.linearIntegration,
            data: {
                ...this.linearIntegration.data,
                teams: this.selectedTeams,
                views,
            },
        });
        await this.$tabs.openTab(
            this.$tabs.createNewTabObject(
                TabType.LINEAR_APP,
                TabType.LINEAR_APP,
            ),
        );
        this.$emit('close');
        close();
    }

    beforeMount() {
        this.selectedTeams = this.linearIntegration?.data?.teams ?? [];
    }
}
</script>

<style lang="scss" scoped>
.linear-modal {
    @include modal;
    width: 400px;
    cursor: default;
    padding: 16px;
    user-select: none;

    &--title {
        @include font14-600;
        color: var(--modal-title-text-color);
        margin-bottom: 4px;
    }

    &--subtitle {
        @include font12-500;
        color: var(--modal-body-text-color);
        margin-bottom: 4px;
    }

    &--body {
        @include scrollbar;
        max-height: 300px;
        overflow: auto;

        :deep(.a-dropdown) {
            padding: 0;
        }

        &--loader {
            @include font12-500;
            color: var(--modal-body-text-color);
            gap: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 80px;
        }
    }

    &--footer {
        padding: 12px 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &--actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 8px;
        }
    }
}
</style>
