<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M8.38,14A7,7,0,1,1,9.67.12a1,1,0,0,1,.58.34,10.21,10.21,0,0,1,0,13.08,1,1,0,0,1-.58.34A7,7,0,0,1,8.38,14Zm0-12a5,5,0,0,0,0,10l.45,0a.24.24,0,0,0,.18-.1A8.2,8.2,0,0,0,9,2.12.24.24,0,0,0,8.83,2Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherGibbousMoon1Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
