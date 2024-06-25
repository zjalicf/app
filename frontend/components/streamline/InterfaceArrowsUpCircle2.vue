<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0Zm3.71,8.71a1,1,0,0,1-1.42,0L7.18,6.59a.25.25,0,0,0-.36,0L4.71,8.71A1,1,0,0,1,3.29,7.29l3-3a1,1,0,0,1,1.42,0l3,3A1,1,0,0,1,10.71,8.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsUpCircle2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
