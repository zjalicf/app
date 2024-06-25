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
                d="M2.25,4.5A2.25,2.25,0,1,1,4.5,2.25,2.25,2.25,0,0,1,2.25,4.5Zm0-3A.75.75,0,1,0,3,2.25.76.76,0,0,0,2.25,1.5Z"
            />
            <path
                d="M11.25,14A6.39,6.39,0,0,1,5,7.5,6.39,6.39,0,0,1,11.25,1a6,6,0,0,1,2.1.38,1,1,0,0,1,.59,1.28,1,1,0,0,1-1.29.59A3.94,3.94,0,0,0,11.25,3,4.39,4.39,0,0,0,7,7.5,4.39,4.39,0,0,0,11.25,12a3.94,3.94,0,0,0,1.4-.25,1,1,0,0,1,1.29.59,1,1,0,0,1-.59,1.28A6,6,0,0,1,11.25,14Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherCelsius',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
