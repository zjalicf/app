<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="3" y="1" width="11" height="9" rx="1.5" />
            <path
                d="M9.75,13h-8A1.76,1.76,0,0,1,0,11.25v-6A.76.76,0,0,1,.75,4.5a.76.76,0,0,1,.75.75v6a.25.25,0,0,0,.25.25h8a.75.75,0,0,1,0,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignLayers3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
