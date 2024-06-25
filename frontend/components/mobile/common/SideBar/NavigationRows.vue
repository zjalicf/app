<template>
    <div class="navigation-rows" :class="{ indent: level !== 0 }">
        <div v-for="(item, index) of filterItems" :key="item.id">
            <NavigationRow
                :class="{
                    root: level === 0,
                    first: index === 0 && level === 0,
                    last: index === filterItems.length - 1,
                }"
                :item="item"
                :has-children="hasChildren(item)"
                :is-expanded="item.expanded"
                :level="level"
                :docs-number="countDocs(item)"
                @collapse-toggle="toggleExpanded"
            />
            <NavigationRows
                v-if="item.expanded"
                :items="itemChildren(item)"
                :level="level + 1"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { ChevronUpIcon, ChevronDownIcon } from '@vue-hero-icons/solid';
import { endOfDay, startOfDay } from 'date-fns';
import NavigationRow from '~/components/mobile/common/SideBar/NavigationRow.vue';
import { isInRange } from '~/helpers/date';
import { ITask } from '~/components/task/model';

@Component({
    name: 'NavigationRows',
    components: {
        ChevronUpIcon,
        ChevronDownIcon,
        NavigationRow,
    },
})
export default class NavigationRows extends Vue {
    collapsed: boolean = false;
    currentItems: any[] = [];

    @Prop({ default: [] })
    items!: any[];

    @Prop({ default: 0 })
    level!: number;

    @Prop({ default: 'folders' })
    type!: string;

    @Watch('items')
    onItemsChange(newItems: any[]) {
        this.currentItems = newItems;
    }

    get filterItems() {
        if (this.type === 'documents') {
            return this.items.filter((item: any) => item.type === 'document');
        }

        return this.currentItems.filter(
            (item: any) => item.type !== 'document',
        );
    }

    countDocs(item: any) {
        if (!['task', 'folder'].includes(item.type)) return;
        if (item.type === 'task') {
            if (item.id === 'inbox') {
                return this.$store.getters['tasks/list'].filter(
                    ({ start, completed }: { start: any; completed: any }) =>
                        !start && !completed,
                ).length;
            }
            if (item.id === 'today') {
                return this.$store.getters['tasks/list']
                    .filter((t: ITask) =>
                        isInRange(t, {
                            start: startOfDay(new Date()),
                            end: endOfDay(new Date()),
                        }),
                    )
                    .filter((task: any) => !task.completed).length;
            }
            return null;
        }
        if (item.id === 'all_documents') {
            return this.$entities.page
                .list()
                .filter(
                    (doc: any) =>
                        !doc.dailyDoc && !doc.template && !doc.archived,
                ).length;
        }
        if (item.id === 'archive') {
            return this.$entities.page.list().filter((doc: any) => doc.archived)
                .length;
        }
        return this.itemChildren(item).filter(
            (item: any) => item.type === 'document' || item.type === 'folder',
        ).length;
    }

    itemChildren(item: any) {
        return this.$store.getters['sidebar/layerByParentId'](item.id);
    }

    hasChildren(item: any) {
        if (item.type === 'folder') {
            const children = this.itemChildren(item);
            return children.filter((item: any) => item.type !== 'document')
                .length;
        }
        return false;
    }

    toggleExpanded(id: string, isExpanded: boolean) {
        this.$entities.folder.toggleExpanded(id, isExpanded);
        this.currentItems = this.currentItems.map((item: any) => {
            if (item.id === id) {
                return { ...item, isExpanded };
            } else {
                return item;
            }
        });
    }

    mounted() {
        this.currentItems = [...this.items];
    }
}
</script>
<style lang="scss" scoped>
.navigation-rows {
    display: flex;
    flex-direction: column;
}
</style>
