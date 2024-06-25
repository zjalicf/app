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
                d="M12,4.6,11,4.28V3a1,1,0,0,0,1-1V1a1,1,0,0,0-1-1H3A1,1,0,0,0,2,1V2A1,1,0,0,0,3,3V4.28l-1,.32A3,3,0,0,0,0,7.44V11a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V7.44A3,3,0,0,0,12,4.6ZM12,11a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1V7.44a1,1,0,0,1,.68-1L4.32,6A1,1,0,0,0,5,5V3.5H9V5a1,1,0,0,0,.68,1l1.64.54a1,1,0,0,1,.68,1Z"
            />
            <rect x="3.5" y="7.5" width="7" height="3" rx="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditInk',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
