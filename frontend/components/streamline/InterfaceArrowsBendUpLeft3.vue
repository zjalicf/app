<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M6.71.79a1,1,0,0,1,0,1.42L3.84,5.07a.26.26,0,0,0,0,.28A.25.25,0,0,0,4,5.5H9a5,5,0,0,1,5,5v2a1,1,0,0,1-2,0v-2a3,3,0,0,0-3-3H4a.25.25,0,0,0-.23.15.26.26,0,0,0,0,.28l2.87,2.86a1,1,0,1,1-1.42,1.42l-5-5a1,1,0,0,1,0-1.42l5-5A1,1,0,0,1,6.71.79Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsBendUpLeft3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
