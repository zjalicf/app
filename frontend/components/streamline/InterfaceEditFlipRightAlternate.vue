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
                d="M9.5,13a1,1,0,0,0-1-1H2.25A.25.25,0,0,1,2,11.75V2.25A.25.25,0,0,1,2.25,2H8.5a1,1,0,0,0,0-2H2A2,2,0,0,0,0,2V12a2,2,0,0,0,2,2H8.5A1,1,0,0,0,9.5,13Z"
            />
            <circle cx="12.75" cy="1.25" r="1.25" />
            <circle cx="12.75" cy="7" r="1.25" />
            <circle cx="12.75" cy="12.75" r="1.25" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditFlipRightAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
