<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.71,7.71a1,1,0,0,0,0-1.42l-6-6a1,1,0,0,0-1.42,0l-6,6A1,1,0,0,0,1.71,7.71L5.57,3.84a.26.26,0,0,1,.28,0A.25.25,0,0,1,6,4v9a1,1,0,0,0,2,0V4a.25.25,0,0,1,.15-.23.26.26,0,0,1,.28,0l3.86,3.87A1,1,0,0,0,13.71,7.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsUp',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
