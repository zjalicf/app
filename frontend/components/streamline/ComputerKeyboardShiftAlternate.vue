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
                d="M5.75,11A.76.76,0,0,1,5,10.25V8H3.75a.75.75,0,0,1-.53-1.28l3.25-3.5a.75.75,0,0,1,1.06,0l3.25,3.5A.75.75,0,0,1,10.25,8H9v2.25a.76.76,0,0,1-.75.75Z"
            />
            <path
                d="M11.25,14H2.75A2.75,2.75,0,0,1,0,11.25V2.75A2.75,2.75,0,0,1,2.75,0h8.5A2.75,2.75,0,0,1,14,2.75v8.5A2.75,2.75,0,0,1,11.25,14ZM2.75,1.5A1.25,1.25,0,0,0,1.5,2.75v8.5A1.25,1.25,0,0,0,2.75,12.5h8.5a1.25,1.25,0,0,0,1.25-1.25V2.75A1.25,1.25,0,0,0,11.25,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerKeyboardShiftAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
