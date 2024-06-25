<template>
    <div class="date-input">
        <input
            ref="dateInput"
            v-model="textValue"
            type="text"
            placeholder="Date"
            @click="click"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown.down.prevent="handleKeyDown"
            @keydown.up.prevent="handleKeyUp"
            @keydown.enter="handleKeyEnter"
            @keydown.esc="handleKeyEsc"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { add, format, sub } from 'date-fns';
import { v4 } from 'uuid';
import DayCalendar from '~/components/date-picker-new/DayCalendar.vue';
@Component({
    name: 'DateInput',
})
export default class DateInput extends Vue {
    textValue: string = '';
    dayPickerOpen: boolean = false;
    proxyId: string = v4();
    @Prop({ default: null })
    value!: Date | null;

    $refs!: {
        dateInput: HTMLDivElement;
    };

    click() {
        this.toggleDayPicker();
    }

    beforeMount() {
        if (!this.value) return;
        this.textValue = format(this.value, 'd MMM');
    }

    handleKeyDown() {
        const newValue = add(this.value, { days: 1 });
        this.$emit('change', newValue);
        this.$nuxt.$emit(`day-picker:update-${this.proxyId}`, newValue);
        if (!this.dayPickerOpen) {
            this.toggleDayPicker();
        }
    }

    handleKeyUp() {
        const newValue = sub(this.value, { days: 1 });
        this.$emit('change', newValue);
        this.$nuxt.$emit(`day-picker:update-${this.proxyId}`, newValue);
        if (!this.dayPickerOpen) {
            this.toggleDayPicker();
        }
    }

    handleInput(value: string) {
        this.textValue = value;
    }

    handleKeyEsc(event: KeyboardEvent) {
        event.stopPropagation();
        this.$dropdown.hide('day-picker');
        if (!this.dayPickerOpen) {
            this.$emit('reset');
        }
    }

    handleKeyEnter() {
        if (!this.dayPickerOpen) {
            this.$dropdown.hideAll();
        }
        this.$dropdown.hide('day-picker');
    }

    @Watch('value')
    handleValueChange(value: Date | null) {
        if (!value) return;
        this.textValue = format(value, 'd MMM');
    }

    handleFocus() {
        if (this.value && this.textValue === format(this.value, 'd MMM'))
            return;
        if (!this.value) {
            this.$emit('change', new Date());
            this.$nuxt.$emit(`day-picker:update-${this.proxyId}`, new Date());
        }
        if (this.value && !this.textValue) {
            this.textValue = format(this.value, 'd MMM');
        }
        this.toggleDayPicker();
    }

    toggleDayPicker() {
        this.$dropdown.hide('day-picker');
        this.dayPickerOpen = true;
        this.$dropdown.show({
            parent: this.$refs.dateInput,
            name: 'day-picker',
            component: DayCalendar,
            retainFocus: true,
            backdrop: false,
            bind: {
                value: this.value,
                'proxy-id': this.proxyId,
            },
            on: {
                change: (value: Date) => {
                    this.$emit('change', value);
                    this.$dropdown.hide('day-picker');
                },
            },
            onClose: () => {
                this.dayPickerOpen = false;
            },
        });
    }

    validDateString(value: string) {
        return !!value.length;
    }

    handleBlur() {
        if (!this.validDateString(this.textValue)) {
            this.textValue = format(this.value, 'd MMM');
        }
        this.$dropdown.hide('day-picker');
    }
}
</script>

<style scoped lang="scss"></style>
