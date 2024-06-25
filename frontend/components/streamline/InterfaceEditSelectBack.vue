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
                d="M10.5,14H1.75A1.76,1.76,0,0,1,0,12.25V3.5a.76.76,0,0,1,.75-.75.76.76,0,0,1,.75.75v8.75a.25.25,0,0,0,.25.25H10.5a.75.75,0,0,1,0,1.5Z"
            />
            <circle cx="12.75" cy="1.25" r="1.25" />
            <circle cx="12.75" cy="9.25" r="1.25" />
            <circle cx="4.75" cy="1.25" r="1.25" />
            <circle cx="12.75" cy="5.25" r="1.25" />
            <circle cx="4.75" cy="5.25" r="1.25" />
            <circle cx="8.75" cy="1.25" r="1.25" />
            <circle cx="4.75" cy="9.25" r="1.25" />
            <circle cx="8.75" cy="9.25" r="1.25" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditSelectBack',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
