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
                d="M8,10.5H2.5A2.5,2.5,0,0,1,0,8V2.5A2.5,2.5,0,0,1,2.5,0H8a2.5,2.5,0,0,1,2.5,2.5V8A2.5,2.5,0,0,1,8,10.5ZM2.5,2a.5.5,0,0,0-.5.5V8a.5.5,0,0,0,.5.5H8A.5.5,0,0,0,8.5,8V2.5A.5.5,0,0,0,8,2Z"
            />
            <path
                d="M12,14H5a1,1,0,0,1,0-2h6.5a.5.5,0,0,0,.5-.5V5a1,1,0,0,1,2,0v7A2,2,0,0,1,12,14Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignBackAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
