<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="4" cy="3.5" r="3.5" />
            <circle cx="11" cy="4.5" r="2.5" />
            <path
                d="M13.26,9.07a.51.51,0,0,0-.48,0l-1.11.56a.14.14,0,0,1-.11,0,.11.11,0,0,1-.06-.1A1.5,1.5,0,0,0,10,8H4A1.5,1.5,0,0,0,2.5,9.5v3A1.5,1.5,0,0,0,4,14h6a1.5,1.5,0,0,0,1.5-1.5.11.11,0,0,1,.06-.1.14.14,0,0,1,.11,0l1.11.56A.54.54,0,0,0,13,13a.48.48,0,0,0,.26-.07.52.52,0,0,0,.24-.43v-3A.52.52,0,0,0,13.26,9.07Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentCameraVideo',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
