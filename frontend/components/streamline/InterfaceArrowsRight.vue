<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7.71,13.71l6-6a1,1,0,0,0,0-1.42l-6-6A1,1,0,0,0,6.29,1.71l3.87,3.86a.26.26,0,0,1,.05.28A.25.25,0,0,1,10,6H1A1,1,0,0,0,1,8h9a.25.25,0,0,1,.23.15.26.26,0,0,1-.05.28L6.29,12.29a1,1,0,0,0,1.42,1.42Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsRight',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
