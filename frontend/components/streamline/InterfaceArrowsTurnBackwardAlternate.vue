<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M3.29.79l-3,3a1,1,0,0,0,0,1.42l3,3a1,1,0,0,0,1.42,0A1,1,0,0,0,5,7.5V5.75a.25.25,0,0,1,.25-.25H8.88a3.08,3.08,0,0,1,3.06,2.4A3,3,0,0,1,9,11.5H5a1,1,0,0,0,0,2H8.78A5.16,5.16,0,0,0,14,9,5,5,0,0,0,9,3.5H5.25A.25.25,0,0,1,5,3.25V1.5A1,1,0,0,0,4.71.79,1,1,0,0,0,3.29.79Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsTurnBackwardAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
