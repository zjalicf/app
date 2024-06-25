<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M1,14a1,1,0,0,1-1-1V2A2,2,0,0,1,2,0H13a1,1,0,0,1,0,2H2.25A.25.25,0,0,0,2,2.25V13A1,1,0,0,1,1,14Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsUpleftCorner',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
