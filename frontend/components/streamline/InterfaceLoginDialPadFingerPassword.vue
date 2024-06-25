<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="1.5" cy="1.5" r="1.5" />
            <circle cx="6" cy="1.5" r="1.5" />
            <circle cx="10.5" cy="1.5" r="1.5" />
            <circle cx="1.5" cy="6" r="1.5" />
            <circle cx="1.5" cy="10.5" r="1.5" />
            <path
                d="M7.5,13.5A.5.5,0,0,0,8,14h5.5a.5.5,0,0,0,.5-.5V13a2,2,0,0,0-2-2H10.25a.25.25,0,0,1-.25-.25v-2a1.25,1.25,0,0,0-2.5,0Z"
            />
            <path
                d="M6,9.28a.25.25,0,0,0-.09-.2A.27.27,0,0,0,5.7,9,1.5,1.5,0,0,0,5.7,12a.27.27,0,0,0,.21-.05.25.25,0,0,0,.09-.2Z"
            />
            <path
                d="M6.19,7.49a.24.24,0,0,0,.18-.12,2.82,2.82,0,0,1,1-1,.24.24,0,0,0,.12-.18A1.21,1.21,0,0,0,7.5,6,1.5,1.5,0,1,0,6,7.5Z"
            />
            <path
                d="M11,7.17a.26.26,0,0,0,.35.07A1.52,1.52,0,0,0,12,6a1.5,1.5,0,0,0-3-.25.25.25,0,0,0,.2.29A2.77,2.77,0,0,1,11,7.17Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLoginDialPadFingerPassword',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
