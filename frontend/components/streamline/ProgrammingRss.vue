<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="2.5" cy="11.5" r="2.5" />
            <path
                d="M2.5,0a1,1,0,0,0,0,2A9.51,9.51,0,0,1,12,11.5a1,1,0,0,0,2,0A11.51,11.51,0,0,0,2.5,0Z"
            />
            <path
                d="M2.5,4.5a1,1,0,0,0,0,2,5,5,0,0,1,5,5,1,1,0,0,0,2,0A7,7,0,0,0,2.5,4.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingRss',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
