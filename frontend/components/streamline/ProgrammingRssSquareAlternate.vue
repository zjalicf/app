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
                d="M12,14H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0H12a2,2,0,0,1,2,2V12A2,2,0,0,1,12,14ZM2,1.5a.5.5,0,0,0-.5.5V12a.5.5,0,0,0,.5.5H12a.5.5,0,0,0,.5-.5V2a.5.5,0,0,0-.5-.5Z"
            />
            <circle cx="4" cy="10" r="1" />
            <path
                d="M7.5,10.25a.76.76,0,0,1-.75-.75A2.25,2.25,0,0,0,4.5,7.25a.75.75,0,0,1,0-1.5A3.75,3.75,0,0,1,8.25,9.5.76.76,0,0,1,7.5,10.25Z"
            />
            <path
                d="M10.5,10.25a.76.76,0,0,1-.75-.75A5.26,5.26,0,0,0,4.5,4.25a.75.75,0,0,1,0-1.5A6.76,6.76,0,0,1,11.25,9.5.76.76,0,0,1,10.5,10.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingRssSquareAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
