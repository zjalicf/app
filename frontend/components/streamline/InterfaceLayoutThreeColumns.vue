<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="5" width="4" height="14" rx="0.25" />
            <path
                d="M12.06,0H10.75a.25.25,0,0,0-.25.25v13.5a.25.25,0,0,0,.25.25h1.31A1.94,1.94,0,0,0,14,12.06V1.94A1.94,1.94,0,0,0,12.06,0Z"
            />
            <path
                d="M3.5.25A.25.25,0,0,0,3.25,0H1.94A1.94,1.94,0,0,0,0,1.94V12.06A1.94,1.94,0,0,0,1.94,14H3.25a.25.25,0,0,0,.25-.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLayoutThreeColumns',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
