<script>
import VueWithCompiler from 'vue/dist/vue.esm';
import InlineDocumentLink from './render/InlineDocumentLink.vue';
import InlineEvent from './render/InlineEvent.vue';
import InlineKatexComponent from './render/InlineKaTeX.vue';
import BlockKatexComponent from './render/BlockKaTeX.vue';
import ImageComponent from './render/Image.vue';
import MermaidComponent from './render/Mermaid.vue';
import JiraIssue from './render/JiraIssue.vue';

export default {
    components: {
        InlineDocumentLink,
        InlineEvent,
        InlineKatexComponent,
        BlockKatexComponent,
        ImageComponent,
        MermaidComponent,
        JiraIssue,
    },
    props: {
        html: {
            type: String,
            default: '',
        },
    },
    data() {
        return { templateRender: undefined };
    },
    watch: {
        html() {
            this.updateRender();
        },
    },
    created() {
        this.updateRender();
    },
    methods: {
        updateRender() {
            const compiled = VueWithCompiler.compile(`<div>${this.html}</div>`);
            this.templateRender = compiled.render;
            this.$options.staticRenderFns = [];
            for (const staticRenderFunction of compiled.staticRenderFns) {
                this.$options.staticRenderFns.push(staticRenderFunction);
            }
        },
    },
    render() {
        return this.templateRender();
    },
};
</script>
