<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,9A2,2,0,1,1,9,7,2,2,0,0,1,7,9Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentMusicNoteDisc',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
