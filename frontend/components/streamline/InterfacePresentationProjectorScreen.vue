<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,2.5V1a1,1,0,0,0-1-1H1A1,1,0,0,0,0,1V2.5a1,1,0,0,0,.8,1,.25.25,0,0,1,.2.24V9.5a.25.25,0,0,1-.25.25.75.75,0,0,0,0,1.5H6a.25.25,0,0,1,.25.25v1.25a.75.75,0,0,0,1.5,0V11.5A.25.25,0,0,1,8,11.25h5.25a.75.75,0,0,0,0-1.5A.25.25,0,0,1,13,9.5V3.72a.25.25,0,0,1,.2-.24A1,1,0,0,0,14,2.5Zm-2.5,7a.25.25,0,0,1-.25.25H2.75A.25.25,0,0,1,2.5,9.5V3.75a.25.25,0,0,1,.25-.25h8.5a.25.25,0,0,1,.25.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfacePresentationProjectorScreen',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
