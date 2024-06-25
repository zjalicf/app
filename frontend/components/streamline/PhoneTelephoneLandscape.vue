<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,10.25V3.75A1.76,1.76,0,0,0,12.25,2H1.75A1.76,1.76,0,0,0,0,3.75v6.5A1.76,1.76,0,0,0,1.75,12h10.5A1.76,1.76,0,0,0,14,10.25ZM2.75,10.5a.25.25,0,0,1-.25-.25V3.75a.25.25,0,0,1,.25-.25h9.5a.25.25,0,0,1,.25.25v6.5a.25.25,0,0,1-.25.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'PhoneTelephoneLandscape',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
