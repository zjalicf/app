<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.75,6.5A1.5,1.5,0,0,0,12.25,5H12a.25.25,0,0,1-.25-.25V4.62A4.69,4.69,0,0,0,7,0,4.69,4.69,0,0,0,2.25,4.62v.13A.25.25,0,0,1,2,5H1.75A1.5,1.5,0,0,0,.25,6.5v2A1.5,1.5,0,0,0,1.75,10h1a1,1,0,0,0,1-1V4.62A3.19,3.19,0,0,1,7,1.5a3.19,3.19,0,0,1,3.25,3.12v6.63A1.25,1.25,0,0,1,9,12.5H7A.75.75,0,0,0,7,14H9a2.75,2.75,0,0,0,2.75-2.75v-1A.25.25,0,0,1,12,10h.25a1.5,1.5,0,0,0,1.5-1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceHelpCustomerSupport3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
