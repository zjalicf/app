<template>
    <div class="mermaid-wrapper">
        <div
            v-if="errorMessage.length"
            class="mermaid-wrapper--error"
            contenteditable="false"
        >
            <p
                v-for="(message, index) of errorMessage"
                :key="index"
                contenteditable="false"
                class="mermaid-wrapper--error--message"
            >
                {{ message }}
            </p>
        </div>
        <div v-if="!errorMessage.length" class="mermaid-wrapper--render">
            <div
                id="mermaid"
                ref="mermaidDiv"
                class="mermaid-wrapper--render--content"
                contenteditable="false"
            ></div>
        </div>
    </div>
</template>

<script lang="js">
import {v4} from 'uuid';
import { ThemeOptions } from "~/helpers/date";
export default {
    name: 'MermaidComponent',
    components: {},
    data() {
        return {
            expression: '',
            errorMessage: [],
            mermaidId: '',
        };
    },
    async mounted() {
        this.mermaidId = `mermaid-${v4()}`;
        this.expression = this.$attrs.expression.replace(/\\n/g, '\n') || '';
        const { default: mermaid } = await import('mermaid');
        const theme = this.$store.getters['appSettings/theme'] === ThemeOptions.DARK ? 'dark' : 'default';
        mermaid.mermaidAPI.initialize({
            theme,
            themeVariables: {
                fontSize: '14px',
            },
        });
        try {
            await mermaid.mermaidAPI.parse(this.expression);
            const { svg } = await mermaid.mermaidAPI.render(
                this.mermaidId,
                this.expression,
            );

            this.$refs.mermaidDiv.innerHTML = svg;
        } catch(err) {
            this.errorMessage = err.str?.split('\n') || [];
        }
    },
};
</script>
<style lang="scss" scoped>
.mermaid-wrapper {
    &--error {
        background: var(--mermaid-error-bg-color);
        border-radius: 6px;
        padding: 6px;
        &--message {
            font-size: 12px;
            color: var(--danger-color);
            overflow: hidden;
        }
    }
    &--render {
        display: flex;
        justify-content: center;
        padding: 4px;
        margin-left: 12px;
        margin-right: 12px;
        border-radius: 6px;
    }
}
</style>
