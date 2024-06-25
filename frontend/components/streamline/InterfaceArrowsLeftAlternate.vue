<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M5.5,8.25A.25.25,0,0,1,5.75,8H13a1,1,0,0,0,0-2H5.75a.25.25,0,0,1-.25-.25V3.5a1,1,0,0,0-.29-.71,1,1,0,0,0-1.42,0L.29,6.29a1,1,0,0,0,0,1.42l3.5,3.5a1,1,0,0,0,1.42,0,1,1,0,0,0,.29-.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsLeftAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
