<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="3" cy="12.25" r="1" />
            <circle cx="7" cy="12.25" r="1" />
            <circle cx="11" cy="12.25" r="1" />
            <path
                d="M10.9,3.42a.26.26,0,0,1-.23-.16,3.94,3.94,0,0,0-7.34,0,.26.26,0,0,1-.23.16,3.17,3.17,0,0,0,.08,6.33h7.64a3.17,3.17,0,0,0,.08-6.33Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherSnow1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
