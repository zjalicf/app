<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7.29,13.21a1,1,0,0,1,0-1.42l2.87-2.86a.26.26,0,0,0,.05-.28A.25.25,0,0,0,10,8.5H5a5,5,0,0,1-5-5v-2a1,1,0,0,1,2,0v2a3,3,0,0,0,3,3h5a.25.25,0,0,0,.23-.15.26.26,0,0,0-.05-.28L7.29,3.21A1,1,0,1,1,8.71,1.79l5,5a1,1,0,0,1,0,1.42l-5,5A1,1,0,0,1,7.29,13.21Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsBendDownRight2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
