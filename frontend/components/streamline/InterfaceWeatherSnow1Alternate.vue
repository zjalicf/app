<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="3" cy="12.5" r="1" />
            <circle cx="7" cy="12.5" r="1" />
            <circle cx="11" cy="12.5" r="1" />
            <path
                d="M11,3a.27.27,0,0,1-.2-.14,4.15,4.15,0,0,0-7.52,0A.27.27,0,0,1,3,3a3.5,3.5,0,0,0,.43,7h7.06A3.5,3.5,0,0,0,11,3Zm-.43,5H3.47a1.5,1.5,0,0,1,0-3,1,1,0,0,1,.25,0,1,1,0,0,0,1.15-.78,2.17,2.17,0,0,1,4.26,0A1,1,0,0,0,10.28,5a1,1,0,0,1,.25,0,1.5,1.5,0,0,1,0,3Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceWeatherSnow1Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
