<template>
    <svg viewBox="0 0 16 16" fill="currentColor" :width="size" :height="size">
        <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"></path>
    </svg>
</template>
<script>
export default {
    name: 'GithubStatusPendingIcon',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
