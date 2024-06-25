<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="6.9" cy="6.59" r="1.75" />
            <path d="M8.4,11.34h-3a.75.75,0,0,1,0-1.5h3a.75.75,0,1,1,0,1.5Z" />
            <path d="M8.4,13.84h-3a.75.75,0,0,1,0-1.5h3a.75.75,0,1,1,0,1.5Z" />
            <path
                d="M2.93,5.75a.74.74,0,0,1-.53-.22.75.75,0,0,1,0-1.06L4.53,2.35A.75.75,0,1,1,5.59,3.41L3.46,5.53A.71.71,0,0,1,2.93,5.75Z"
            />
            <path
                d="M1.17,4a.71.71,0,0,1-.53-.22.74.74,0,0,1,0-1.06L2.76.58A.75.75,0,1,1,3.82,1.64L1.7,3.76A.74.74,0,0,1,1.17,4Z"
            />
            <path
                d="M13.36,1.79,12,.38a.74.74,0,0,0-1.06,0L9.06,2.2a.77.77,0,0,0-.22.53.75.75,0,0,0,.22.53l1.41,1.42a.76.76,0,0,0,1.07,0l1.82-1.83a.75.75,0,0,0,0-1.06Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerConnectionCableSplit',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
