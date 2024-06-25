<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path
                d="M6.29,9.71a1,1,0,0,0,1.42,0l3-3a1,1,0,0,0,0-1.42A1,1,0,0,0,10,5H8.25A.25.25,0,0,1,8,4.75V1A1,1,0,0,0,6,1V4.75A.25.25,0,0,1,5.75,5H4a1,1,0,0,0-.71.29,1,1,0,0,0,0,1.42Z"
            />
            <path d="M3.5,14h7a1,1,0,0,0,0-2h-7a1,1,0,0,0,0,2Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsBottomAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
