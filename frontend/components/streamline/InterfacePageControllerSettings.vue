<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect width="6" height="6" rx="0.5" />
            <path d="M13.25,11.5h-5a.75.75,0,0,0,0,1.5h5a.75.75,0,0,0,0-1.5Z" />
            <path d="M13.25,8.5h-5a.75.75,0,0,0,0,1.5h5a.75.75,0,0,0,0-1.5Z" />
            <path
                d="M8,6h5.5a.48.48,0,0,0,.43-.25.5.5,0,0,0,0-.49l-2.75-5a.52.52,0,0,0-.88,0l-2.75,5a.5.5,0,0,0,0,.49A.48.48,0,0,0,8,6Z"
            />
            <circle cx="3" cy="11" r="3" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfacePageControllerSettings',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
