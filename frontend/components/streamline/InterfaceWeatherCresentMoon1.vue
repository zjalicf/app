<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.72,12.6a6.51,6.51,0,0,1,0-11.2A.48.48,0,0,0,12,.94a.52.52,0,0,0-.31-.43A7,7,0,1,0,9,14a7,7,0,0,0,2.63-.51.52.52,0,0,0,.31-.43A.48.48,0,0,0,11.72,12.6Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherCresentMoon1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
