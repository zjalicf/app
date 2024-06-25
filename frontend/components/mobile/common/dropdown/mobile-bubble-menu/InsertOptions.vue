<template>
    <div class="options">
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('page-link')"
        >
            <div class="options--option--title">
                <InterfaceContentFile size="14" class="icon" />
                <p>Page Link</p>
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('table')"
        >
            <div class="options--option--title">
                <ShoppingBusinessTable size="14" class="icon" />
                <p>Table</p>
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('list')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingListBullets size="16" class="icon" />
                <p>List</p>
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('codeblock')"
        >
            <div class="options--option--title">
                <ProgrammingBrowserCode1 size="16" class="icon" />
                <p>Code Block</p>
            </div>
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceTextFormattingParagraph from '~/components/streamline/InterfaceTextFormattingParagraph.vue';
import Header1 from '~/components/icons/Header1.vue';
import Header2 from '~/components/icons/Header2.vue';
import Header3 from '~/components/icons/Header3.vue';
import ProgrammingScriptCode from '~/components/streamline/ProgrammingScriptCode.vue';
import InterfaceTextFormattingSuperScript from '~/components/streamline/InterfaceTextFormattingSuperScript.vue';
import InterfaceTextFormattingSubScript from '~/components/streamline/InterfaceTextFormattingSubScript.vue';
import ShoppingBusinessTable from '~/components/streamline/ShoppingBusinessTable.vue';
import InterfaceTextFormattingListBullets from '~/components/streamline/InterfaceTextFormattingListBullets.vue';
import ProgrammingBrowserCode1 from '~/components/streamline/ProgrammingBrowserCode1.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import InterfaceContentFile from '~/components/streamline/InterfaceContentFile.vue';
import MoneyCashierCalculator1 from '~/components/streamline/MoneyCashierCalculator1.vue';

@Component({
    name: 'InsertOptions',
    components: {
        MoneyCashierCalculator1,
        InterfaceContentFile,
        InterfaceCalendar,
        ProgrammingBrowserCode1,
        InterfaceTextFormattingListBullets,
        ShoppingBusinessTable,
        InterfaceTextFormattingSubScript,
        InterfaceTextFormattingSuperScript,
        ProgrammingScriptCode,
        Header3,
        Header2,
        Header1,
        InterfaceTextFormattingParagraph,
        InterfaceValidationCheck,
    },
})
export default class InsertOptions extends Vue {
    @Prop({ default: null })
    editor!: any;

    toggleAction(action: string) {
        this.$emit(action);
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.options {
    @include mobileBubbleMenuDropdown;
}
</style>
