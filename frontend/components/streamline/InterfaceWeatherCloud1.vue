<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.9,5.17A.26.26,0,0,1,10.67,5,3.94,3.94,0,0,0,3.33,5a.26.26,0,0,1-.23.16,3.17,3.17,0,0,0,.08,6.33h7.64a3.17,3.17,0,0,0,.08-6.33Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherCloud1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
