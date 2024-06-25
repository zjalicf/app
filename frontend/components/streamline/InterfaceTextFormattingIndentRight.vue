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
                d="M5.25,1.25H.75a.75.75,0,0,0,0,1.5h4.5a.75.75,0,0,0,0-1.5Z"
            />
            <path d="M5.25,5H2.75a.75.75,0,0,0,0,1.5h2.5a.75.75,0,0,0,0-1.5Z" />
            <path
                d="M6,9.25a.76.76,0,0,0-.75-.75H.75a.75.75,0,0,0,0,1.5h4.5A.76.76,0,0,0,6,9.25Z"
            />
            <path
                d="M5.25,12.25H2.75a.75.75,0,0,0,0,1.5h2.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M12.49,7.18a.25.25,0,0,1,0-.36l1.29-1.29a.75.75,0,0,0-1.06-1.06l-2,2a.75.75,0,0,0,0,1.06l2,2a.75.75,0,0,0,1.06,0,.75.75,0,0,0,0-1.06Z"
            />
            <path
                d="M8.25,0A.76.76,0,0,0,7.5.75v12.5a.75.75,0,0,0,1.5,0V.75A.76.76,0,0,0,8.25,0Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingIndentRight',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
