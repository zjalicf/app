<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path
                d="M4.25,12.81a.24.24,0,0,0-.07.21.23.23,0,0,0,.11.18A4.93,4.93,0,0,0,7,14a5,5,0,0,0,5-5,7.09,7.09,0,0,0-.79-2.68A.26.26,0,0,0,11,6.18a.28.28,0,0,0-.22.07Z"
            />
            <path
                d="M13.78.22a.75.75,0,0,0-1.06,0L9.79,3.15a.25.25,0,0,1-.2.07.27.27,0,0,1-.19-.11C8.47,1.65,7.6.47,7.4.2a.52.52,0,0,0-.8,0C6.13.83,2,6.42,2,9a5,5,0,0,0,.23,1.51.25.25,0,0,1-.06.26l-1.95,2a.75.75,0,0,0,0,1.06.75.75,0,0,0,1.06,0l12.5-12.5A.75.75,0,0,0,13.78.22Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherHumidityNone',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
