<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM9.5,8h-5a1,1,0,0,1,0-2h5a1,1,0,0,1,0,2Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceRemoveCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
