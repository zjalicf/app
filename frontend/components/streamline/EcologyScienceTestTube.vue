<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.5,0h-9a1,1,0,0,0,0,2h.25A.25.25,0,0,1,3,2.25V10a4,4,0,0,0,8,0V2.25A.25.25,0,0,1,11.25,2h.25a1,1,0,0,0,0-2ZM9,10a2,2,0,0,1-4,0V2.25A.25.25,0,0,1,5.25,2h3.5A.25.25,0,0,1,9,2.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EcologyScienceTestTube',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
