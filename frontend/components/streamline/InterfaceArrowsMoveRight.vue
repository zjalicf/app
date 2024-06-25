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
                d="M13.78,6.47,10.53,3.22A.75.75,0,1,0,9.47,4.28L11,5.82a.26.26,0,0,1,.06.28.25.25,0,0,1-.23.15H6.25a.75.75,0,0,0,0,1.5h4.59a.25.25,0,0,1,.23.15.26.26,0,0,1-.06.28L9.47,9.72a.75.75,0,0,0,0,1.06.75.75,0,0,0,1.06,0l3.25-3.25A.75.75,0,0,0,13.78,6.47Z"
            />
            <rect width="4" height="14" rx="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsMoveRight',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
