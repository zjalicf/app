<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0C3.13,0,0,1.52,0,5.38S3.18,14,7,14s7-4.75,7-8.62S10.87,0,7,0ZM5.71,7.49a.28.28,0,0,1-.22.22A3.16,3.16,0,0,1,3,7.15a3.17,3.17,0,0,1-.56-2.46.25.25,0,0,1,.22-.22A3.17,3.17,0,0,1,5.15,5,3.16,3.16,0,0,1,5.71,7.49ZM11,7.15a3.16,3.16,0,0,1-2.46.56.28.28,0,0,1-.22-.22A3.16,3.16,0,0,1,8.85,5a3.17,3.17,0,0,1,2.46-.56.25.25,0,0,1,.22.22A3.17,3.17,0,0,1,11,7.15Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EcologyScienceAlien',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
