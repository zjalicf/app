<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM8.27,9.34a.25.25,0,0,1-.19.17l-3.65.73a.58.58,0,0,1-.67-.67l.73-3.65a.24.24,0,0,1,.42-.12L8.2,9.09A.25.25,0,0,1,8.27,9.34ZM9.51,8.08a.24.24,0,0,1-.42.12L5.8,4.91a.24.24,0,0,1,.12-.42l3.65-.73a.58.58,0,0,1,.67.67Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelMapLocationCompass2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
