<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.47,8.72,8.18,11a.26.26,0,0,1-.28.06.25.25,0,0,1-.15-.23V3.16a.25.25,0,0,1,.15-.23A.26.26,0,0,1,8.18,3l2.29,2.29a.75.75,0,0,0,1.06-1.06l-4-4a.75.75,0,0,0-1.06,0l-4,4A.75.75,0,0,0,3.53,5.28L5.82,3a.26.26,0,0,1,.28-.06.25.25,0,0,1,.15.23v7.68a.25.25,0,0,1-.15.23A.26.26,0,0,1,5.82,11L3.53,8.72A.75.75,0,0,0,2.47,9.78l4,4a.75.75,0,0,0,1.06,0l4-4a.75.75,0,0,0-1.06-1.06Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsVertical',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
