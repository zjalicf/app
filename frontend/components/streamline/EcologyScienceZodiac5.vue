<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M9.87,4.93a.26.26,0,0,1-.1-.2.22.22,0,0,1,.09-.2A4.73,4.73,0,0,0,11.75.75a.75.75,0,0,0-1.5,0,3.25,3.25,0,0,1-6.5,0,.75.75,0,0,0-1.5,0A4.73,4.73,0,0,0,4.14,4.53a.22.22,0,0,1,.09.2.26.26,0,0,1-.1.2,5,5,0,1,0,5.74,0ZM7,12.5A3.5,3.5,0,1,1,10.5,9,3.5,3.5,0,0,1,7,12.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EcologyScienceZodiac5',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
