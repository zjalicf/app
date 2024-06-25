<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0Zm.45,7.6-3,2.25a.74.74,0,0,1-.78.07.75.75,0,0,1-.42-.67V4.75a.75.75,0,0,1,.42-.67.74.74,0,0,1,.78.07l3,2.25a.75.75,0,0,1,0,1.2Zm3.3,1.65a.75.75,0,0,1-1.5,0V4.75a.75.75,0,0,1,1.5,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonNextCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
