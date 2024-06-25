<template>
    <div class="language-selector">
        <ASelect
            :items="items"
            :value="activeLanguage"
            :search="true"
            :width="null"
            :name="'language-selector'"
            :placeholder="activeLanguage || 'Select language'"
            :clear="true"
            :search-placeholder="'Search languages'"
            :check-placement="'end'"
            :show-arrow="false"
            @change="$emit('select-language', $event)"
        />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';

@Component({
    name: 'LanguageSelector',
    components: { ASelect },
})
export default class LanguageSelector extends Vue {
    @Prop({ default: () => [] })
    languages!: string[];

    @Prop({ default: '' })
    activeLanguage!: string;

    selectedIndex: number = 0;
    @Prop({ default: false })
    selectionOpen!: boolean;

    get items() {
        return this.languages.map((language: string) => ({
            id: language,
            label: language,
        }));
    }

    query: string = '';
    $refs!: {
        input: HTMLInputElement;
    };

    get searchResults() {
        return this.languages.filter((language: string) =>
            language.toLowerCase().startsWith(this.query.toLowerCase()),
        );
    }

    @Watch('searchResults')
    handleResultsChange(curr: any[], prev: any[]) {
        if (this.selectedIndex >= curr.length && curr.length > 0) {
            this.selectedIndex = curr.length - 1;
        }
    }

    upHandler() {
        this.selectedIndex =
            (this.selectedIndex + this.searchResults.length - 1) %
            this.searchResults.length;
    }

    downHandler() {
        this.selectedIndex =
            (this.selectedIndex + 1) % this.searchResults.length;
    }

    close() {
        this.$refs?.input?.blur();
        this.query = '';
        this.$emit('change', false);
    }

    handleEscKey() {
        this.close();
    }

    handleEnterKey() {
        if (!this.searchResults.length) return;
        this.$emit('select-language', this.searchResults[this.selectedIndex]);
        this.close();
    }

    handleUpKey() {
        this.upHandler();
    }

    handleDownKey() {
        this.downHandler();
    }
}
</script>

<style lang="scss" scoped>
.language-selector {
    user-select: none;
}
</style>
