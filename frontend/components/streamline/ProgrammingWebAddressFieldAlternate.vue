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
                d="M7,8.67a4.25,4.25,0,0,1,6.61-3.45.25.25,0,0,0,.26,0A.26.26,0,0,0,14,5V1a1,1,0,0,0-1-1H1A1,1,0,0,0,0,1V8A1,1,0,0,0,1,9H6.78a.2.2,0,0,0,.16-.07A.19.19,0,0,0,7,8.77ZM3.5,5.75a.75.75,0,0,1-1.5,0V3.25a.75.75,0,0,1,1.5,0Z"
            />
            <path
                d="M11.25,6A2.71,2.71,0,0,0,8.5,8.67c0,1.11,1.57,4,2.33,5.11a.51.51,0,0,0,.84,0c.76-1.15,2.33-4,2.33-5.11A2.71,2.71,0,0,0,11.25,6Zm0,3.75a1,1,0,1,1,1-1A1,1,0,0,1,11.25,9.75Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingWebAddressFieldAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
