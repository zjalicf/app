<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,13a1,1,0,0,1-1,1H2a2,2,0,0,1-2-2V1A1,1,0,0,1,2,1V11.75a.25.25,0,0,0,.25.25H13A1,1,0,0,1,14,13Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsDownleftCorner',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
