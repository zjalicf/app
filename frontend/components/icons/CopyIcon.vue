<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24">
        <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
        >
            <path
                d="M19.4 20H9.6a.6.6 0 0 1-.6-.6V9.6a.6.6 0 0 1 .6-.6h9.8a.6.6 0 0 1 .6.6v9.8a.6.6 0 0 1-.6.6Z"
            ></path>
            <path
                d="M15 9V4.6a.6.6 0 0 0-.6-.6H4.6a.6.6 0 0 0-.6.6v9.8a.6.6 0 0 0 .6.6H9"
            ></path>
        </g>
    </svg>
</template>

<script>
export default {
    name: 'CopyIcon',
    props: {
        size: {
            type: String,
            default: '20',
        },
    },
};
</script>
