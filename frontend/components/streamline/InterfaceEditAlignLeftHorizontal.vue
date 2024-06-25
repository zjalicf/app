<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.5,2H1.5A1.5,1.5,0,0,0,0,3.5v7A1.5,1.5,0,0,0,1.5,12h11A1.5,1.5,0,0,0,14,10.5v-7A1.5,1.5,0,0,0,12.5,2Zm-9,7.25a.75.75,0,0,1-1.5,0V4.75a.75.75,0,0,1,1.5,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditAlignLeftHorizontal',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
