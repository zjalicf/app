<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,14A7,7,0,1,0,0,7,7,7,0,0,0,7,14Zm.29-3.29-3-3a1,1,0,0,1,0-1.42l3-3A1,1,0,0,1,8.71,4.71L6.59,6.82a.25.25,0,0,0,0,.36L8.71,9.29a1,1,0,0,1-1.42,1.42Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsLeftCircle2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
