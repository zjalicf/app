<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <g>
                <path
                    d="M6.65,4.35a.48.48,0,0,0,.7,0l3.5-3.5A.47.47,0,0,0,11,.31.5.5,0,0,0,10.5,0h-7A.5.5,0,0,0,3,.31a.47.47,0,0,0,.11.54Z"
                />
                <path
                    d="M7.35,9.65a.48.48,0,0,0-.7,0l-3.5,3.5a.47.47,0,0,0-.11.54A.5.5,0,0,0,3.5,14h7a.5.5,0,0,0,.46-.31.47.47,0,0,0-.11-.54Z"
                />
            </g>
            <path d="M13.25,7.75h-2a.75.75,0,0,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
            <path d="M8,7.75H6a.75.75,0,0,1,0-1.5H8a.75.75,0,0,1,0,1.5Z" />
            <path d="M2.75,7.75h-2a.75.75,0,0,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditFlipVertical2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
