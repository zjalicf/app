<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.25,0H3.75A1.76,1.76,0,0,0,2,1.75v10.5A1.76,1.76,0,0,0,3.75,14h6.5A1.76,1.76,0,0,0,12,12.25V1.75A1.76,1.76,0,0,0,10.25,0ZM7,4A1,1,0,1,1,8,3,1,1,0,0,1,7,4Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'PhoneTelephoneBackCamera1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
