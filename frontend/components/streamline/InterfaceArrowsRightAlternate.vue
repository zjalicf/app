<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M8.5,5.75A.25.25,0,0,1,8.25,6H1A1,1,0,0,0,1,8H8.25a.25.25,0,0,1,.25.25V10.5a1,1,0,0,0,.29.71,1,1,0,0,0,1.42,0l3.5-3.5a1,1,0,0,0,0-1.42l-3.5-3.5a1,1,0,0,0-1.42,0,1,1,0,0,0-.29.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsRightAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
