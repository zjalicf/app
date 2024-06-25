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
                d="M12.25,10.51a.26.26,0,0,0,.32.05A3,3,0,0,0,11.5,5,4.25,4.25,0,0,0,4.71,1.85a.27.27,0,0,0-.1.17.31.31,0,0,0,.07.2Z"
            />
            <path
                d="M11.8,12.24,1.3.74a.75.75,0,1,0-1.1,1l2,2.15a.25.25,0,0,1,.06.22.26.26,0,0,1-.14.17A3.5,3.5,0,0,0,3.5,11h5a.25.25,0,0,1,.18.08l2,2.18a.75.75,0,0,0,1.06,0A.75.75,0,0,0,11.8,12.24Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingCloudOff',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
