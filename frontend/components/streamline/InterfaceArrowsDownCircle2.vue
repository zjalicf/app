<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,7a7,7,0,1,0-7,7A7,7,0,0,0,14,7Zm-3.29-.29-3,3a1,1,0,0,1-1.42,0l-3-3A1,1,0,0,1,4.71,5.29L6.82,7.41a.25.25,0,0,0,.36,0L9.29,5.29a1,1,0,1,1,1.42,1.42Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsDownCircle2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
