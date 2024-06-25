<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M5.5,0A6.85,6.85,0,0,0,4.22.12a.51.51,0,0,0-.3.17,10.51,10.51,0,0,0,0,13.42.51.51,0,0,0,.3.17A6.85,6.85,0,0,0,5.5,14a7,7,0,0,0,0-14Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherGibbousMoon2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
