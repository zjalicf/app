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
                d="M7.75,5A.25.25,0,0,0,8,4.75V4A1,1,0,0,0,6,4v.75A.25.25,0,0,0,6.25,5Z"
            />
            <path
                d="M14,1.75A1.76,1.76,0,0,0,12.25,0H1.75A1.76,1.76,0,0,0,0,1.75v7.5A1.76,1.76,0,0,0,1.75,11H5a.26.26,0,0,1,.21.11.29.29,0,0,1,0,.24L4.56,13a.75.75,0,0,0,.69,1h3.5a.75.75,0,0,0,.69-1l-.67-1.61a.29.29,0,0,1,0-.24A.26.26,0,0,1,9,11h3.25A1.76,1.76,0,0,0,14,9.25Zm-4,6.5A.76.76,0,0,1,9.25,9H4.75A.76.76,0,0,1,4,8.25V5.75a.75.75,0,0,1,.37-.65.25.25,0,0,0,.13-.22V4a2.5,2.5,0,0,1,5,0v.88a.25.25,0,0,0,.13.22.75.75,0,0,1,.37.65Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerDesktopLock',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
