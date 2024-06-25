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
                d="M13.25,0H.75A.76.76,0,0,0,0,.75a.76.76,0,0,0,.75.75h12.5A.76.76,0,0,0,14,.75.76.76,0,0,0,13.25,0Z"
            />
            <rect x="8" y="3" width="5" height="7" rx="1.5" />
            <rect x="1" y="3" width="5" height="11" rx="1.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignVerticalTop',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
