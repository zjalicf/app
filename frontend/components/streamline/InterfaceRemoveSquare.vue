<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.5,0h-7A3.5,3.5,0,0,0,0,3.5v7A3.5,3.5,0,0,0,3.5,14h7A3.5,3.5,0,0,0,14,10.5v-7A3.5,3.5,0,0,0,10.5,0Zm-1,8h-5a1,1,0,0,1,0-2h5a1,1,0,0,1,0,2Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceRemoveSquare',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
