<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,2a2,2,0,0,0-2-2H2A2,2,0,0,0,0,2V12a2,2,0,0,0,2,2H12a2,2,0,0,0,2-2ZM7,3A2,2,0,1,1,5,5,2,2,0,0,1,7,3Zm3.57,7.22a.5.5,0,0,1-.45.28H3.88a.5.5,0,0,1-.45-.28.49.49,0,0,1,.06-.53,4.49,4.49,0,0,1,7,0A.49.49,0,0,1,10.57,10.22Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceUserSquare',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
