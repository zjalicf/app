<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,12a2,2,0,0,1-2,2H1a1,1,0,0,1,0-2H11.75a.25.25,0,0,0,.25-.25V1a1,1,0,0,1,2,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsDownrightCorner',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
