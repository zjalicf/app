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
                d="M13,1.75A1.76,1.76,0,0,0,11.25,0H2.75A1.76,1.76,0,0,0,1,1.75v10.5A1.76,1.76,0,0,0,2.75,14h8.5A1.76,1.76,0,0,0,13,12.25Zm-10.5,0a.25.25,0,0,1,.25-.25h8.5a.25.25,0,0,1,.25.25v9a.25.25,0,0,1-.25.25H2.75a.25.25,0,0,1-.25-.25Z"
            />
            <path d="M9.5,4h-5a.5.5,0,0,1,0-1h5a.5.5,0,0,1,0,1Z" />
            <path d="M9.5,6.5h-5a.5.5,0,0,1,0-1h5a.5.5,0,0,1,0,1Z" />
            <path d="M7,9H4.5a.5.5,0,0,1,0-1H7A.5.5,0,0,1,7,9Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerHandHeld',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
