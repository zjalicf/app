<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M8.93,3.3a.24.24,0,0,1,0,.35L.29,12.29a1,1,0,0,0,1.42,1.42l8.64-8.64a.24.24,0,0,1,.35,0l1.59,1.59A1,1,0,0,0,14,6V1a1,1,0,0,0-1-1H8.05a1,1,0,0,0-.71,1.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsCornerUpRightAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
