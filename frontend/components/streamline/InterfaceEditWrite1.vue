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
                d="M11.75,12.49H.75a.75.75,0,0,0,0,1.5h11a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M13.56,1.49,12.5.43a1.55,1.55,0,0,0-2.12,0L3.67,7.14a.5.5,0,0,0-.14.27l-.53,3a.51.51,0,0,0,.14.44.49.49,0,0,0,.35.15h.09l3-.53a.51.51,0,0,0,.26-.14l6.71-6.71A1.5,1.5,0,0,0,14,2.55,1.52,1.52,0,0,0,13.56,1.49Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditWrite1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
