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
                d="M9.89,4.86l-2.5-1.5a.74.74,0,0,0-.76,0A.75.75,0,0,0,6.25,4V6.5a.23.23,0,0,1-.08.18A.21.21,0,0,1,6,6.75H5.75a2,2,0,1,0,2,2v-3a.26.26,0,0,1,.38-.22l1,.59a.75.75,0,0,0,.78-1.28Z"
            />
            <path
                d="M7,14a7,7,0,1,1,7-7A7,7,0,0,1,7,14ZM7,1.5A5.5,5.5,0,1,0,12.5,7,5.51,5.51,0,0,0,7,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentMusicNoteCircleAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
