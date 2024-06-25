<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path d="M3.75,0a.5.5,0,0,0-.5.5v13a.5.5,0,0,0,.5.5,7,7,0,0,0,0-14Z" />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherFirstQuarterMoon',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
