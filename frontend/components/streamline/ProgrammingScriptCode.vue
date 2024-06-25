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
                d="M5.21,11.21a1,1,0,0,1-1.42,0L.29,7.71a1,1,0,0,1,0-1.42l3.5-3.5A1,1,0,0,1,5.21,4.21L2.59,6.82a.25.25,0,0,0,0,.36L5.21,9.79A1,1,0,0,1,5.21,11.21Z"
            />
            <path
                d="M8.79,11.21a1,1,0,0,1,0-1.42l2.62-2.61a.25.25,0,0,0,0-.36L8.79,4.21a1,1,0,0,1,1.42-1.42l3.5,3.5a1,1,0,0,1,0,1.42l-3.5,3.5A1,1,0,0,1,8.79,11.21Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingScriptCode',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
