<template>
    <div class="cloud-features">
        <ul>
            <li>
                <ProgrammingCloudCheck size="14" class="icon" />
                Sync files across devices
            </li>
            <li>
                <ProgrammingApplicationAdd size="14" class="icon" />
                Integrations (Github, Jira) <span>PRO</span>
            </li>
            <li>
                <PhoneMobilePhone size="14" class="icon" />
                Web access & mobile apps
            </li>
            <li>
                <InterfaceShare size="14" class="icon" />
                Publishing
                <span>PRO</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import PhoneMobilePhone from '@/components/streamline/PhoneMobilePhone.vue';
import InterfaceShare from '@/components/streamline/InterfaceShare.vue';
import ProgrammingCloudCheck from '@/components/streamline/ProgrammingCloudCheck.vue';
import ProgrammingApplicationAdd from '@/components/streamline/ProgrammingApplicationAdd.vue';
</script>

<style lang="scss" scoped>
.cloud-features {
    width: 100%;
    background: var(--cloud-features-bg-color);
    margin-bottom: 35px;
    padding: 17px 0px 20px;
    border-radius: 12px;

    ul {
        padding-left: 20px;

        li {
            @include font12-500;
            color: var(--cloud-features-text-color);
            display: flex;
            align-items: center;

            &:not(:last-of-type) {
                margin-bottom: 8px;
            }

            .icon {
                margin-right: 11px;
            }

            span {
                @include proBadge;
                margin-left: 5px;
            }
        }
    }
}
</style>
