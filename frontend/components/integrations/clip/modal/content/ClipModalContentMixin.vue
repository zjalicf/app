<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CInput from '~/components/CInput.vue';
@Component({
    name: 'ClipModalContentMixin',
})
export default class ClipModalContentMixin extends Vue {
    issueFetching: boolean = false;
    errorMessage: string | null = null;
    selected: string | null = null;
    url: string = '';

    $refs!: {
        input: CInput;
    };

    focusInput() {
        this.$refs.input?.setFocus();
    }

    onError(message: string) {
        this.issueFetching = false;
        this.selected = null;
        this.errorMessage = message;
    }

    onSelected(newValue: string) {
        this.selected = newValue;
        this.issueFetching = false;
        this.errorMessage = null;
    }

    onSelectedFromPicker(newValue: string) {
        this.selected = newValue;
        this.errorMessage = null;
        this.url = '';
        this.errorMessage = null;
    }

    onUrlSelected(newValue: string) {
        this.selected = newValue;
        this.errorMessage = null;
    }

    modalAccept() {
        this.$emit('accept', this.selected);
    }

    modalCancel() {
        this.$emit('cancel');
    }
}
</script>
