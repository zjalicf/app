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
                d="M5.53,9.53A.75.75,0,0,0,4.47,8.47L.22,12.72a.75.75,0,0,0,1.06,1.06Z"
            />
            <path
                d="M5,0H.75A.76.76,0,0,0,0,.75V5a.76.76,0,0,0,.75.75.76.76,0,0,0,.54-.23L2.7,4.11a.24.24,0,0,1,.35,0l9.67,9.67a.75.75,0,0,0,1.06-1.06L4.11,3.05a.24.24,0,0,1,0-.35L5.52,1.29A.76.76,0,0,0,5.75.75.76.76,0,0,0,5,0Z"
            />
            <path
                d="M14,5V.75A.76.76,0,0,0,13.25,0H9a.76.76,0,0,0-.75.75.74.74,0,0,0,.26.56L9.89,2.69a.25.25,0,0,1,0,.36L8.47,4.47A.75.75,0,0,0,9.53,5.53L11,4.11a.25.25,0,0,1,.36,0l1.22,1.22c.23.22.41.42.72.42A.76.76,0,0,0,14,5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsCrossoverUpAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
