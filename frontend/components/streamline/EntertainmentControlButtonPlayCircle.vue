<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0Zm3.17,7.62-4,2.75a.76.76,0,0,1-.77,0A.74.74,0,0,1,5,9.75V4.25a.74.74,0,0,1,.4-.66.76.76,0,0,1,.77,0l4,2.75a.75.75,0,0,1,0,1.24Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonPlayCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
