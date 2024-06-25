<template>
    <div class="options">
        <button
            class="options--option"
            :disabled="!editor.can().addRowBefore()"
            @mousedown.stop.prevent="$emit('rowAbove')"
        >
            <div class="options--option--title">
                <TableRowPlusBefore class="icon" />
                <p>Insert Row Above</p>
            </div>
        </button>
        <button
            class="options--option"
            :disabled="!editor.can().addRowAfter()"
            @mousedown.stop.prevent="$emit('rowBelow')"
        >
            <div class="options--option--title">
                <TableRowPlusAfter class="icon" />
                <p>Insert Row Below</p>
            </div>
        </button>
        <button
            class="options--option"
            :disabled="!editor.can().deleteRow()"
            @mousedown.stop.prevent="$emit('removeRow')"
        >
            <div class="options--option--title">
                <TableRowRemove class="icon" />
                <p>Remove Last Row</p>
            </div>
        </button>
        <div class="divider"></div>
        <button
            class="options--option"
            :disabled="!editor.can().addColumnBefore()"
            @mousedown.stop.prevent="$emit('columnBefore')"
        >
            <div class="options--option--title">
                <TableColumnPlusBefore class="icon" />
                <p>Add Column Before</p>
            </div>
        </button>
        <button
            class="options--option"
            :disabled="!editor.can().addColumnAfter()"
            @mousedown.stop.prevent="$emit('columnAfter')"
        >
            <div class="options--option--title">
                <TableColumnPlusAfter class="icon" />
                <p>Add Column After</p>
            </div>
        </button>
        <button
            class="options--option"
            :disabled="!editor.can().deleteColumn()"
            @mousedown.stop.prevent="$emit('removeColumn')"
        >
            <div class="options--option--title">
                <TableColumnRemove class="icon" />
                <p>Remove Last Column</p>
            </div>
        </button>
        <div class="divider"></div>
        <button
            class="options--option danger"
            :disabled="!editor.can().deleteTable()"
            @mousedown.stop.prevent="$emit('deleteTable')"
        >
            <div class="options--option--title">
                <TableDeleteIcon class="icon" />
                <p>Remove Table</p>
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
import TableRowPlusBefore from '~/components/icons/TableRowPlusBefore.vue';
import TableRowPlusAfter from '~/components/icons/TableRowPlusAfter.vue';
import TableRowRemove from '~/components/icons/TableRowRemove.vue';
import TableColumnPlusBefore from '~/components/icons/TableColumnPlusBefore.vue';
import TableColumnPlusAfter from '~/components/icons/TableColumnPlusAfter.vue';
import TableColumnRemove from '~/components/icons/TableColumnRemove.vue';
import TableDeleteIcon from '~/components/icons/TableDeleteIcon.vue';

@Component({
    name: 'TableOptions',
    components: {
        TableDeleteIcon,
        TableColumnRemove,
        TableColumnPlusAfter,
        TableColumnPlusBefore,
        TableRowRemove,
        TableRowPlusAfter,
        TableRowPlusBefore,
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
export default class TableOptions extends Vue {
    @Prop({ default: null })
    editor!: any;
}
</script>
<style lang="scss" scoped>
.divider {
    height: 1px;
    background: rgba($blueGrey200, 0.37);
}

.options {
    @include mobileBubbleMenuDropdown;
}
</style>
