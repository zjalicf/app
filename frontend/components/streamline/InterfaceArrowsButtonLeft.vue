<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M5.49,7.18a.25.25,0,0,1,0-.36L10.6,1.71a1,1,0,0,0,0-1.42,1,1,0,0,0-1.41,0L3.54,5.94a1.51,1.51,0,0,0,0,2.12l5.65,5.65a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.42Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsButtonLeft',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
