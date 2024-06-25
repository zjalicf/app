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
                d="M11.7,5.56a1,1,0,0,1-1.41,0L7.18,2.45a.25.25,0,0,0-.36,0L3.71,5.56a1,1,0,0,1-1.41,0,1,1,0,0,1,0-1.41L6,.41A1.38,1.38,0,0,1,8,.41L11.7,4.15A1,1,0,0,1,11.7,5.56Z"
            />
            <path
                d="M7,14a1.36,1.36,0,0,1-1-.4L2.3,9.85a1,1,0,0,1,0-1.41,1,1,0,0,1,1.41,0l3.11,3.11a.25.25,0,0,0,.36,0l3.11-3.11a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.41L8,13.59A1.36,1.36,0,0,1,7,14Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfacePageControllerScrollUpDown',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
