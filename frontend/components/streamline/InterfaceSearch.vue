<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.71,13.71a1,1,0,0,0,0-1.42L11,9.62a.24.24,0,0,1,0-.31A6,6,0,1,0,9.31,11a.24.24,0,0,1,.31,0l2.67,2.67A1,1,0,0,0,13.71,13.71ZM2,6a4,4,0,1,1,4,4A4,4,0,0,1,2,6Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSearch',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
