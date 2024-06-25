<script>
export default {
    name: 'ResizeAuto',
    props: {
        size: {
            type: Number,
            default: 40,
        },
        max: {
            type: Number,
            default: null,
            required: false,
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.$el.setAttribute('style', `height: ${this.getSize()}px`);
        });
    },
    methods: {
        getSize() {
            let size = this.$el.scrollHeight || this.size;
            if (!this.max) return size;
            if (size > this.max) {
                size = this.max;
            }

            return size;
        },
        resize(event) {
            event.target.style.height = 'auto';
            event.target.style.height = `${this.getSize()}px`;
        },
    },
    render() {
        return this.$scopedSlots.default({
            resize: this.resize,
        });
    },
};
</script>
