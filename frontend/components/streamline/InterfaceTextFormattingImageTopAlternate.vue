<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path d="M9.75,12.5h-9a.75.75,0,0,0,0,1.5h9a.75.75,0,0,0,0-1.5Z" />
            <path
                d="M13.25,8.5H.75a.75.75,0,0,0,0,1.5h12.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M12.25,6H1.75A1.76,1.76,0,0,1,0,4.25V1.75A1.76,1.76,0,0,1,1.75,0h10.5A1.76,1.76,0,0,1,14,1.75v2.5A1.76,1.76,0,0,1,12.25,6ZM1.75,1.5a.25.25,0,0,0-.25.25v2.5a.25.25,0,0,0,.25.25h10.5a.25.25,0,0,0,.25-.25V1.75a.25.25,0,0,0-.25-.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingImageTopAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
