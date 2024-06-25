<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.67,6.08a.27.27,0,0,1-.19-.22,4.25,4.25,0,0,0-8.25-1A.25.25,0,0,1,3,5a3.5,3.5,0,0,0,.47,7H11a3,3,0,0,0,.67-5.92Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingCloud',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
