<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,7a7,7,0,1,0-7,7A7,7,0,0,0,14,7ZM8,9.44a.74.74,0,0,1-.46-.69V8a.25.25,0,0,0-.25-.25H4a.75.75,0,0,1,0-1.5H7.25A.25.25,0,0,0,7.5,6V5.25A.74.74,0,0,1,8,4.56a.75.75,0,0,1,.82.16l1.75,1.75a.75.75,0,0,1,0,1.06L8.78,9.28A.75.75,0,0,1,8,9.44Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsRightCircle1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
