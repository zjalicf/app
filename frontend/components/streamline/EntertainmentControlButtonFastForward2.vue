<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.25,2h-1a.76.76,0,0,0-.75.75v2a.26.26,0,0,1-.14.23.24.24,0,0,1-.27,0L7.94,2.35A1.49,1.49,0,0,0,5.5,3.48v.88a.25.25,0,0,1-.41.2L2.44,2.35A1.49,1.49,0,0,0,0,3.48v7a1.48,1.48,0,0,0,2.43,1.14L5.09,9.44a.25.25,0,0,1,.41.2v.88a1.48,1.48,0,0,0,2.43,1.14L11.09,9a.24.24,0,0,1,.27,0,.26.26,0,0,1,.14.23v2a.76.76,0,0,0,.75.75h1a.76.76,0,0,0,.75-.75V2.75A.76.76,0,0,0,13.25,2Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonFastForward2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
