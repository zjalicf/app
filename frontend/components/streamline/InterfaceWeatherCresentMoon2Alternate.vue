<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M1.88,12.64a1,1,0,0,0,.62.85A7,7,0,1,0,5.13,0,7,7,0,0,0,2.5.51a1,1,0,0,0-.62.85,1,1,0,0,0,.48.94A5.48,5.48,0,0,1,5.05,7a5.48,5.48,0,0,1-2.69,4.7A1,1,0,0,0,1.88,12.64ZM7.05,7A7.45,7.45,0,0,0,5.48,2.44.26.26,0,0,1,5.71,2a5,5,0,0,1,0,9.94.26.26,0,0,1-.23-.41A7.45,7.45,0,0,0,7.05,7Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherCresentMoon2Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
