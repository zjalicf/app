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
                d="M7,7a.76.76,0,0,1-.75-.75V4a.75.75,0,0,1,1.5,0V6.25A.76.76,0,0,1,7,7Z"
            />
            <circle cx="7" cy="9" r="1" />
            <path
                d="M7,14a1.76,1.76,0,0,1-1.26-.52L.52,8.26a1.79,1.79,0,0,1,0-2.52L5.74.52a1.79,1.79,0,0,1,2.52,0h0l5.22,5.22a1.79,1.79,0,0,1,0,2.52L8.26,13.48A1.76,1.76,0,0,1,7,14ZM7,1.5a.32.32,0,0,0-.2.08L1.58,6.8A.29.29,0,0,0,1.5,7a.3.3,0,0,0,.08.2L6.8,12.42a.28.28,0,0,0,.4,0L12.42,7.2A.3.3,0,0,0,12.5,7a.29.29,0,0,0-.08-.2L7.2,1.58A.32.32,0,0,0,7,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlertWarningDiamondAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
