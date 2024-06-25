<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path d="M13,8H1A1,1,0,0,1,1,6H13a1,1,0,0,1,0,2Z" />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceRemove1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
