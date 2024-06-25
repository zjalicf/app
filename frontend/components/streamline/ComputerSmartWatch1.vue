<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M9.4,3.19A.25.25,0,0,1,9.28,3L9.1,1.33A1.5,1.5,0,0,0,7.6,0H6.4A1.5,1.5,0,0,0,4.9,1.33L4.72,3a.25.25,0,0,1-.12.18,4.51,4.51,0,0,0,0,7.62.25.25,0,0,1,.12.18l.18,1.68A1.5,1.5,0,0,0,6.4,14H7.6a1.5,1.5,0,0,0,1.5-1.33L9.28,11a.25.25,0,0,1,.12-.18,4.51,4.51,0,0,0,0-7.62ZM7,10a3,3,0,1,1,3-3A3,3,0,0,1,7,10Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerSmartWatch1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
