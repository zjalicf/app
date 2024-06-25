<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.08.29a.51.51,0,0,0-.3-.17A6.85,6.85,0,0,0,8.5,0a7,7,0,0,0,0,14,6.85,6.85,0,0,0,1.28-.12.51.51,0,0,0,.3-.17,10.51,10.51,0,0,0,0-13.42Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherGibbousMoon1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
