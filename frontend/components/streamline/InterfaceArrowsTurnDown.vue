<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M.29,9.71l4,4a1,1,0,0,0,1.42,0l4-4A1,1,0,0,0,8.29,8.29L6.43,10.16a.26.26,0,0,1-.28.05A.25.25,0,0,1,6,10V5a3,3,0,0,1,6,0V7a1,1,0,0,0,2,0V5A5,5,0,0,0,4,5v5a.25.25,0,0,1-.15.23.26.26,0,0,1-.28-.05L1.71,8.29A1,1,0,0,0,.29,9.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsTurnDown',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
