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
                d="M7.71,4.29a1,1,0,0,0-1.41,0L1.79,8.8a1,1,0,0,0,0,1.42,1,1,0,0,0,1.41,0L5.58,7.84a.25.25,0,0,1,.27,0A.25.25,0,0,1,6,8v5a1,1,0,0,0,2,0V8a.26.26,0,0,1,.16-.23.25.25,0,0,1,.27,0l2.37,2.37a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.42Z"
            />
            <path d="M10.5,0h-7a1,1,0,0,0,0,2h7a1,1,0,0,0,0-2Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsTop',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
