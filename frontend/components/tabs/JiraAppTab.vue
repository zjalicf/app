<template>
    <div class="jira" @mousedown="$emit('focus-tab')">
        <div v-if="$accessControl.hasProAccess" class="jira--content">
            <div class="jira--content--issues">
                <JiraView />
            </div>
        </div>
        <div v-else class="jira__access-denied">
            <h2>Jira Integration is a PRO feature.</h2>
            <button class="jira__access-denied__button" @click="upgrade">
                <div class="jira__access-denied__button__icon">
                    <ShoppingBusinessStartup size="16" class="icon" />
                </div>
                <div class="jira__access-denied__button__text pro">
                    Upgrade to
                    <p class="pro-badge">PRO</p>
                </div>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { transition } from '~/helpers/util';
import JiraView from '~/components/integrations/jira/JiraView.vue';
import TabMixin from '~/components/tabs/TabMixin.vue';
import ShoppingBusinessStartup from '~/components/streamline/ShoppingBusinessStartup.vue';

@Component({
    name: 'DocumentsIndex',
    components: {
        ShoppingBusinessStartup,
        JiraView,
    },
    transition,
})
export default class JiraAppTab extends TabMixin<any> {
    registerShortcuts() {
        this.$shortcutsManager.enableNamespace('jira');
    }

    removeShortcuts() {
        this.$shortcutsManager.disableNamespace('jira');
    }

    mounted() {
        this.registerShortcuts();
    }

    beforeDestroy() {
        this.removeShortcuts();
    }

    upgrade() {
        this.$accessControl.showProModal();
    }

    updateGroupData(data: Partial<any>) {
        const groupDataProperties = [
            'collapsed',
            'selectedDisplayProperties',
            'orderAscending',
            'filterByAssignee',
        ];
        const groupData = groupDataProperties.reduce((acc: any, key: any) => {
            if (key in data) {
                acc[key] = data[key];
            }
            return acc;
        }, {} as any);
        if (!Object.keys(groupData).length) return;
        this.$tabs.updateGroupData(this.groupId, this.entityId, groupData);
    }
}
</script>

<style scoped lang="scss">
.pro-badge {
    @include proBadge;
}

.pro {
    display: flex;
    align-items: center;
    gap: 4px;
}

.jira {
    height: $desktopContentHeight;

    &--content {
        position: relative;
        height: 100%;

        &--issues {
            @include scrollbar;
            position: relative;
            z-index: 1;
            overflow-y: overlay;
            height: 100%;
            width: 100%;
        }
    }

    &__access-denied {
        user-select: none;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 8px;

        h2 {
            @include font-title;
        }

        &__button {
            outline: none;
            display: flex;
            border-radius: 6px;
            align-items: center;
            text-align: left;
            padding: 8px 13px;
            color: var(--workspace-selector-dropdown-text-color);

            &__icon {
                margin-left: 2px;
                margin-right: 8px;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .icon {
                flex-shrink: 0;
            }

            &__text {
                font-style: normal;
                font-weight: 600;
                font-size: 13px;
                line-height: 1;
            }

            &:hover {
                @include frostedGlassButton;
                color: var(--workspace-selector-dropdown-text-color__hover);
            }
        }
    }
}
</style>
