<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.47,10.11A.5.5,0,0,0,13,9.9,7,7,0,0,1,12,10,6,6,0,0,1,6.88.76a.5.5,0,0,0,0-.54A.51.51,0,0,0,6.38,0,7,7,0,0,0,7.49,14a7,7,0,0,0,6-3.35A.5.5,0,0,0,13.47,10.11Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherMoon',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
