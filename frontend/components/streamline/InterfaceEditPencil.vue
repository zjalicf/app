<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.56,2.23,11.77.44a1.51,1.51,0,0,0-2.14,0L1.4,8.67a.48.48,0,0,0-.12.22L0,13.36a.49.49,0,0,0,.13.49A.47.47,0,0,0,.5,14l.13,0,4.48-1.26a.43.43,0,0,0,.22-.12l8.23-8.23A1.54,1.54,0,0,0,14,3.3,1.5,1.5,0,0,0,13.56,2.23Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditPencil',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
