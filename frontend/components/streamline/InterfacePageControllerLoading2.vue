<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect y="5" width="6.5" height="4" rx="1" />
            <rect x="7.75" y="5" width="3.5" height="4" rx="1" />
            <path
                d="M13.25,5a.76.76,0,0,0-.75.75v2.5a.75.75,0,0,0,1.5,0V5.75A.76.76,0,0,0,13.25,5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfacePageControllerLoading2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
