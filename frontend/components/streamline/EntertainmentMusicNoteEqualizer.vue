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
                d="M.75,9A.76.76,0,0,1,0,8.25V5.75A.76.76,0,0,1,.75,5a.76.76,0,0,1,.75.75v2.5A.76.76,0,0,1,.75,9Z"
            />
            <path
                d="M3.75,11.5A.76.76,0,0,1,3,10.75V3.25a.75.75,0,0,1,1.5,0v7.5A.76.76,0,0,1,3.75,11.5Z"
            />
            <path
                d="M7,14a.76.76,0,0,1-.75-.75V.75a.75.75,0,0,1,1.5,0v12.5A.76.76,0,0,1,7,14Z"
            />
            <path
                d="M10.25,11.5a.76.76,0,0,1-.75-.75V3.25a.75.75,0,0,1,1.5,0v7.5A.76.76,0,0,1,10.25,11.5Z"
            />
            <path
                d="M13.25,9a.76.76,0,0,1-.75-.75V5.75a.75.75,0,0,1,1.5,0v2.5A.76.76,0,0,1,13.25,9Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentMusicNoteEqualizer',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
