<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.67,6.08a.27.27,0,0,1-.19-.22,4.25,4.25,0,0,0-8.25-1A.25.25,0,0,1,3,5a3.5,3.5,0,0,0,.47,7H11a3,3,0,0,0,.67-5.92ZM6.5,10a.5.5,0,0,1-1,0V8.25A.25.25,0,0,0,5.25,8H4.5a.52.52,0,0,1-.44-.25.54.54,0,0,1,0-.51l1.5-2.5A.5.5,0,0,1,6.5,5Zm3.93-2.24-1.5,2.5a.49.49,0,0,1-.56.22A.5.5,0,0,1,8,10V5A.5.5,0,0,1,9,5V6.75A.25.25,0,0,0,9.25,7H10a.52.52,0,0,1,.44.25A.54.54,0,0,1,10.43,7.76Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingCloudDataTransfer',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
