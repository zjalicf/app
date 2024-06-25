<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11,12A3,3,0,0,1,8,9V5.25A.25.25,0,0,1,8.25,5H10a1,1,0,0,0,.74-1.7l-3-3a1,1,0,0,0-1.42,0l-3,3a1,1,0,0,0,0,1.42A1,1,0,0,0,4,5H5.75A.25.25,0,0,1,6,5.25V9a3,3,0,0,1-3,3,1,1,0,0,0,0,2,5,5,0,0,0,3.81-1.76.25.25,0,0,1,.38,0A5,5,0,0,0,11,14a1,1,0,0,0,0-2ZM8,3.43H8v0Zm-2,0,0,0v0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsSplitVerticalAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
