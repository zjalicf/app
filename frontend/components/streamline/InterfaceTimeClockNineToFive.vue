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
                d="M7.75,11.75v1.5a.75.75,0,0,1-1.5,0v-1.5a.75.75,0,0,1,1.5,0Z"
            />
            <path
                d="M4.24,10.82,3.18,11.88a.75.75,0,1,1-1.06-1.06L3.18,9.76a.75.75,0,1,1,1.06,1.06Z"
            />
            <path
                d="M6.9,7.5a.26.26,0,0,1,.17.07l4.27,4.27a.51.51,0,0,0,.36.15.51.51,0,0,0,.36-.15A7,7,0,1,0,0,7a.5.5,0,0,0,.5.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTimeClockNineToFive',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
