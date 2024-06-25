<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M4.29.29l-4,4a1,1,0,0,0,0,1.42l4,4A1,1,0,1,0,5.71,8.29L3.84,6.43a.26.26,0,0,1,0-.28A.25.25,0,0,1,4,6H9a3,3,0,0,1,0,6H7a1,1,0,0,0,0,2H9A5,5,0,0,0,9,4H4a.25.25,0,0,1-.23-.15.26.26,0,0,1,0-.28L5.71,1.71A1,1,0,0,0,4.29.29Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsTurnBackward',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
