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
                d="M10.21,6.29l-3.5-3.5a1,1,0,0,0-1.09-.21A1,1,0,0,0,5,3.5V5.75A.25.25,0,0,1,4.75,6H1A1,1,0,0,0,1,8H4.75A.25.25,0,0,1,5,8.25V10.5a1,1,0,0,0,.62.92A.84.84,0,0,0,6,11.5a1,1,0,0,0,.71-.29l3.5-3.5A1,1,0,0,0,10.21,6.29Z"
            />
            <path
                d="M13,11.5a1,1,0,0,1-1-1v-7a1,1,0,0,1,2,0v7A1,1,0,0,1,13,11.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerKeyboardNext',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
