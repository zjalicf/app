<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path d="M12,14H2a1,1,0,0,1,0-2H12a1,1,0,0,1,0,2Z" />
            <path
                d="M7,10.5a5,5,0,0,1-5-5V1A1,1,0,0,1,4,1V5.5a3,3,0,0,0,6,0V1a1,1,0,0,1,2,0V5.5A5,5,0,0,1,7,10.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingUnderline',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
