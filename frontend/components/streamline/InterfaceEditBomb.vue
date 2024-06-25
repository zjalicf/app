<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.78.22a.75.75,0,0,0-1.06,0l-2,2a.25.25,0,0,1-.33,0,6.5,6.5,0,1,0,1.37,1.37.25.25,0,0,1,0-.33l2-2A.75.75,0,0,0,13.78.22ZM6.5,4.75A2.75,2.75,0,0,0,3.75,7.5a.75.75,0,0,1-1.5,0A4.26,4.26,0,0,1,6.5,3.25a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditBomb',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
