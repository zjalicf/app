<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13,13.25a1,1,0,0,1-1-1V7.5a.25.25,0,0,0-.25-.25H4a.25.25,0,0,0-.23.15.26.26,0,0,0,0,.28L6.21,10a1,1,0,0,1,0,1.42,1,1,0,0,1-1.42,0L.29,7a1,1,0,0,1,0-1.42L4.79,1A1,1,0,0,1,6.21,2.46L3.84,4.82a.26.26,0,0,0,0,.28A.25.25,0,0,0,4,5.25h8a2,2,0,0,1,2,2v5A1,1,0,0,1,13,13.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsBendLeft1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
