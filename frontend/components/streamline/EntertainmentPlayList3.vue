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
                d="M10.25,0H3.75A1.76,1.76,0,0,0,2,1.75v10.5A1.76,1.76,0,0,0,3.75,14h6.5A1.76,1.76,0,0,0,12,12.25V1.75A1.76,1.76,0,0,0,10.25,0Zm.25,10.25a.25.25,0,0,1-.25.25H3.75a.25.25,0,0,1-.25-.25V1.75a.25.25,0,0,1,.25-.25h6.5a.25.25,0,0,1,.25.25Z"
            />
            <path
                d="M8.68,5.39,6.18,3.64a.73.73,0,0,0-.78-.06.77.77,0,0,0-.4.67v3.5a.77.77,0,0,0,.4.67.85.85,0,0,0,.35.08.76.76,0,0,0,.43-.14l2.5-1.75a.74.74,0,0,0,0-1.22Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentPlayList3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
