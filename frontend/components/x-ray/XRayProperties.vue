<template>
    <div class="x-ray-properties">
        <div class="x-ray-properties--list">
            <h4>
                Created at:
                <span
                    ><tippy
                        :content="`<div class='tooltip mini-calendar'>${fullProperties.createdAtFull}</div>`"
                        placement="top"
                        :delay="[400, 20]"
                        theme="tooltip"
                        :touch="false"
                        >{{ fullProperties.createdAt }} ago</tippy
                    >
                </span>
            </h4>
            <h4>
                Updated at:
                <span
                    ><tippy
                        :content="`<div class='tooltip mini-calendar'>${fullProperties.updatedAtFull}</div>`"
                        placement="top"
                        :delay="[400, 20]"
                        theme="tooltip"
                        :touch="false"
                        >{{ fullProperties.updatedAt }} ago</tippy
                    >
                </span>
            </h4>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { format, formatDistance } from 'date-fns';
import DocumentLink from '~/components/document/DocumentLink.vue';

@Component({
    name: 'XRayProperties',
    components: { DocumentLink },
})
export default class XRayProperties extends Vue {
    @Prop({
        default: () => ({
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    })
    properties!: { createdAt: Date; updatedAt: Date };

    get fullProperties() {
        return {
            createdAt: formatDistance(
                new Date(),
                new Date(this.properties.createdAt),
            ),
            createdAtFull: format(
                new Date(this.properties.createdAt),
                'd LLLL yyyy, H:mm',
            ),
            updatedAt: formatDistance(
                new Date(),
                new Date(this.properties.updatedAt),
            ),
            updatedAtFull: format(
                new Date(this.properties.updatedAt),
                'd LLLL yyyy, H:mm',
            ),
        };
    }
}
</script>

<style lang="scss" scoped>
.x-ray-properties {
    &--list {
        &:not(:last-of-type) {
            margin-bottom: 15px;
        }

        h4 {
            display: flex;
            align-items: center;
            padding-left: 6px;
            font-weight: 600;
            font-size: 12px;
            line-height: 155.2%;
            color: var(--x-ray-title-color);

            > span {
                color: var(--x-ray-subtitle-color);
                margin-left: 4px;
            }
        }
    }
}
</style>
