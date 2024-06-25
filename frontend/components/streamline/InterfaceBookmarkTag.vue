<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.61,8.31l-8-8A1,1,0,0,0,4.85,0L1.12.25a.94.94,0,0,0-.87.87L0,4.85a.92.92,0,0,0,.27.72l8,8a1.34,1.34,0,0,0,1.89,0l3.41-3.41a1.34,1.34,0,0,0,0-1.89Zm-9-3.68a1.24,1.24,0,1,1,0-1.76A1.24,1.24,0,0,1,4.63,4.63Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceBookmarkTag',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
