<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,3A2,2,0,1,1,5,5,2,2,0,0,1,7,3Zm3.14,7.82a4.77,4.77,0,0,1-6.28,0,.25.25,0,0,1,0-.35,4.14,4.14,0,0,1,6.33,0A.25.25,0,0,1,10.14,10.82Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceUserCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
