<template>
    <div class="template-dropdown">
        <ASelect
            :items="allTemplates"
            :value="selectedTemplate"
            :width="134"
            :dropdown-width="286"
            :search="true"
            :show-arrow="true"
            search-placeholder="Search for a template"
            check-placement="end"
            placeholder="Select template"
            @change="handleTemplateChange"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { XIcon } from '@vue-hero-icons/solid';
import CDropDownSimple from '~/components/CDropDownSimple.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import ASelect from '~/components/ASelect.vue';

@Component({
    name: 'TemplateDropdown',
    components: {
        ASelect,
        CDropDownSimple,
        XIcon,
        InterfaceContentFileAlternate,
    },
})
export default class TemplateDropdown extends Vue {
    @Prop({ required: true })
    templates!: any[];

    @Prop({ default: null })
    selectedTemplate!: any;

    get allTemplates() {
        return [
            { label: 'No Template', id: null },
            ...this.templates.map(doc => ({
                label: doc.title,
                id: doc.id,
                icon: doc.icon
                    ? {
                          icon: DocumentIcon,
                          bind: { document: doc, size: 16, fontSize: 14 },
                      }
                    : { icon: InterfaceContentFileAlternate },
            })),
        ];
    }

    handleTemplateChange(newSelectionId: string) {
        this.$emit('template:update', newSelectionId);
    }
}
</script>
