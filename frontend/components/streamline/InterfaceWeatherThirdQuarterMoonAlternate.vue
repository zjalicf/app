<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10,14A7,7,0,0,1,10,0a1,1,0,0,1,1,1V13A1,1,0,0,1,10,14ZM9,2.42a.26.26,0,0,0-.1-.2.24.24,0,0,0-.22,0,5,5,0,0,0,0,9.64.24.24,0,0,0,.22,0,.26.26,0,0,0,.1-.2Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherThirdQuarterMoonAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
