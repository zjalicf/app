<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0A5,5,0,0,0,2,5c0,2.58,4.13,8.17,4.6,8.8a.5.5,0,0,0,.8,0C7.87,13.17,12,7.58,12,5A5,5,0,0,0,7,0ZM7,6.5A1.5,1.5,0,1,1,8.5,5,1.5,1.5,0,0,1,7,6.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelMapLocationPin',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
