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
                d="M13.89,12.55,12.62,10a.25.25,0,0,1,0-.24A6.44,6.44,0,0,0,13.5,6.5a6.5,6.5,0,0,0-13,0,6.44,6.44,0,0,0,.88,3.26.25.25,0,0,1,0,.24L.11,12.55a1,1,0,0,0,.44,1.34A.93.93,0,0,0,1,14a1,1,0,0,0,.89-.55l.84-1.67a.26.26,0,0,1,.16-.13.27.27,0,0,1,.21,0,6.5,6.5,0,0,0,7.8,0,.27.27,0,0,1,.21,0,.26.26,0,0,1,.16.13l.84,1.67A1,1,0,0,0,13,14a.93.93,0,0,0,.45-.11A1,1,0,0,0,13.89,12.55ZM7,9.5a3,3,0,1,1,3-3A3,3,0,0,1,7,9.5Z"
            />
            <circle cx="7" cy="6.5" r="1.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerWebcam',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
