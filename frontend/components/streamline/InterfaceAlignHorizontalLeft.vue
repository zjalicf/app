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
                d="M.75,0A.76.76,0,0,0,0,.75v12.5A.76.76,0,0,0,.75,14a.76.76,0,0,0,.75-.75V.75A.76.76,0,0,0,.75,0Z"
            />
            <rect x="3" y="1" width="7" height="5" rx="1.5" />
            <rect x="3" y="8" width="11" height="5" rx="1.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignHorizontalLeft',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
