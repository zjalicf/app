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
                d="M4.25,11.5a.76.76,0,0,1-.54-.23L.32,7.78a1.11,1.11,0,0,1,0-1.57L3.71,2.73a.75.75,0,0,1,1.08,1l-3,3.06a.26.26,0,0,0,0,.35l3,3.05a.75.75,0,0,1,0,1.06A.73.73,0,0,1,4.25,11.5Z"
            />
            <path
                d="M9.75,11.5a.73.73,0,0,1-.52-.21.75.75,0,0,1,0-1.06l3-3.05a.26.26,0,0,0,0-.35l-3-3.06a.75.75,0,0,1,1.08-1l3.39,3.49a1.11,1.11,0,0,1,0,1.57l-3.38,3.48A.76.76,0,0,1,9.75,11.5Z"
            />
            <circle cx="7" cy="7" r="1.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsHorizonalScrollPoint',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
