<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M3.4,13.71a1,1,0,0,1,0-1.42L8.51,7.18a.25.25,0,0,0,0-.36L3.4,1.71A1,1,0,0,1,3.4.29a1,1,0,0,1,1.41,0l5.65,5.65a1.51,1.51,0,0,1,0,2.12L4.81,13.71A1,1,0,0,1,3.4,13.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsButtonRight',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
