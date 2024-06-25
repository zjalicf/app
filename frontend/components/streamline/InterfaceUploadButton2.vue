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
                d="M4,3.78A.75.75,0,0,0,5,3.78L5.82,3a.26.26,0,0,1,.28-.06.25.25,0,0,1,.15.23V8.25a.75.75,0,0,0,1.5,0V3.16a.25.25,0,0,1,.15-.23A.26.26,0,0,1,8.18,3L9,3.78a.75.75,0,0,0,1.06,0,.75.75,0,0,0,0-1.06L7.53.22a.75.75,0,0,0-1.06,0L4,2.72A.75.75,0,0,0,4,3.78Z"
            />
            <path
                d="M13,9.5a1,1,0,0,0-1,1v1.25a.25.25,0,0,1-.25.25H2.25A.25.25,0,0,1,2,11.75V10.5a1,1,0,0,0-2,0V12a2,2,0,0,0,2,2H12a2,2,0,0,0,2-2V10.5A1,1,0,0,0,13,9.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceUploadButton2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
