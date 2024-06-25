<template>
    <v-runtime-template
        :template="`<div v-once class='read-only-editor'>${
            html || '<p></p>'
        }</div>`"
    ></v-runtime-template>
</template>

<script>
import VRuntimeTemplate from 'v-runtime-template';
import InlineDocumentLink from './render/InlineDocumentLink.vue';
import InlineEvent from './render/InlineEvent.vue';
import InlineKatexComponent from './render/InlineKaTeX.vue';
import BlockKatexComponent from './render/BlockKaTeX.vue';
import ImageComponent from './render/Image.vue';
import MermaidComponent from './render/Mermaid.vue';
import JiraIssue from './render/JiraIssue.vue';
import GithubLink from '~/components/util/render/GithubLink.vue';
import JiraLink from '~/components/util/render/JiraLink.vue';

export default {
    components: {
        VRuntimeTemplate,
        // eslint-disable-next-line vue/no-unused-components
        InlineDocumentLink,
        // eslint-disable-next-line vue/no-unused-components
        InlineEvent,
        // eslint-disable-next-line vue/no-unused-components
        InlineKatexComponent,
        // eslint-disable-next-line vue/no-unused-components
        BlockKatexComponent,
        // eslint-disable-next-line vue/no-unused-components
        ImageComponent,
        // eslint-disable-next-line vue/no-unused-components
        MermaidComponent,
        // eslint-disable-next-line vue/no-unused-components
        JiraIssue,
        // eslint-disable-next-line vue/no-unused-components
        GithubLink,
        // eslint-disable-next-line vue/no-unused-components
        JiraLink,
    },
    props: {
        html: {
            type: String,
            default: '',
        },
    },
    computed: {},
};
</script>
