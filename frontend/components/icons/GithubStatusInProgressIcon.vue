<template>
    <svg
        class="rotate"
        viewBox="0 0 16 16"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            stroke="#DBAB0A"
            stroke-width="2"
            d="M3.05 3.05a7 7 0 1 1 9.9 9.9 7 7 0 0 1-9.9-9.9Z"
            opacity=".5"
        ></path>
        <path
            fill="#DBAB0A"
            fill-rule="evenodd"
            d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
            clip-rule="evenodd"
        ></path>
        <path fill="#DBAB0A" d="M14 8a6 6 0 0 0-6-6V0a8 8 0 0 1 8 8h-2Z"></path>
    </svg>
</template>
<script>
export default {
    name: 'GithubStatusInProgressIcon',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
