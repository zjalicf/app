<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,7a1.49,1.49,0,0,0-2.72-.86.26.26,0,0,1-.21.11H9.55a.24.24,0,0,1-.23-.16,2.49,2.49,0,0,0-4.64,0,.24.24,0,0,1-.23.16H2.93a.26.26,0,0,1-.21-.11,1.5,1.5,0,1,0,0,1.72.26.26,0,0,1,.21-.11H4.45a.24.24,0,0,1,.23.16,2.49,2.49,0,0,0,4.64,0,.24.24,0,0,1,.23-.16h1.52a.26.26,0,0,1,.21.11A1.49,1.49,0,0,0,14,7Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingWebSteps2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
