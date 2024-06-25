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
                d="M13.25,0a.76.76,0,0,0-.75.75v12.5a.75.75,0,0,0,1.5,0V.75A.76.76,0,0,0,13.25,0Z"
            />
            <rect x="4" y="1" width="7" height="5" rx="1.5" />
            <rect y="8" width="11" height="5" rx="1.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignHorizontalRight',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
