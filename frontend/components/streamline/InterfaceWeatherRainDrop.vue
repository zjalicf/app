<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7.4.19a.52.52,0,0,0-.8,0C6.13.82,2,6.42,2,9A5,5,0,0,0,12,9C12,6.42,7.87.82,7.4.19Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherRainDrop',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
