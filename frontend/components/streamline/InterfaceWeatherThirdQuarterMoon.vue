<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.25,0a7,7,0,0,0,0,14,.5.5,0,0,0,.5-.5V.5A.5.5,0,0,0,10.25,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherThirdQuarterMoon',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
