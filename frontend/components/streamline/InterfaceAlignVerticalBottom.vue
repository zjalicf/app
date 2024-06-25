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
                d="M13.25,12.5H.75a.75.75,0,0,0,0,1.5h12.5a.75.75,0,0,0,0-1.5Z"
            />
            <rect x="8" y="4" width="5" height="7" rx="1.5" />
            <rect x="1" width="5" height="11" rx="1.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignVerticalBottom',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
