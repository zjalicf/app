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
                d="M7,14A7,7,0,0,1,0,7a.76.76,0,0,1,.75-.75H6A.25.25,0,0,0,6.25,6V.75A.76.76,0,0,1,7,0,7,7,0,0,1,7,14ZM1.85,7.75a.25.25,0,0,0-.2.09.26.26,0,0,0,0,.21A5.5,5.5,0,1,0,8.05,1.6a.3.3,0,0,0-.21,0,.25.25,0,0,0-.09.2V7A.76.76,0,0,1,7,7.75Z"
            />
            <path
                d="M4.24,4.24a.74.74,0,0,1-1.06,0L2.12,3.18A.75.75,0,0,1,3.18,2.12L4.24,3.18A.74.74,0,0,1,4.24,4.24Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTimeNineAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
