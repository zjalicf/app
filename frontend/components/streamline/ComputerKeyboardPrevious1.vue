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
                d="M13,6H9.25A.25.25,0,0,1,9,5.75V3.5a1,1,0,0,0-.62-.92,1,1,0,0,0-1.09.21l-3.5,3.5a1,1,0,0,0,0,1.42l3.5,3.5A1,1,0,0,0,8,11.5a.84.84,0,0,0,.38-.08A1,1,0,0,0,9,10.5V8.25A.25.25,0,0,1,9.25,8H13a1,1,0,0,0,0-2Z"
            />
            <path
                d="M1,11.5a1,1,0,0,1-1-1v-7a1,1,0,0,1,2,0v7A1,1,0,0,1,1,11.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerKeyboardPrevious1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
