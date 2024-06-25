<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,4.5A4.51,4.51,0,0,0,9.5,0h-5A4.51,4.51,0,0,0,0,4.5v4A2.5,2.5,0,0,0,2.5,11L3,12.63A2,2,0,0,0,4.94,14H9.06A2,2,0,0,0,11,12.63L11.5,11A2.5,2.5,0,0,0,14,8.5ZM3.75,7.75a2,2,0,1,1,2-2A2,2,0,0,1,3.75,7.75Zm6.5,0a2,2,0,1,1,2-2A2,2,0,0,1,10.25,7.75Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditSkull2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
