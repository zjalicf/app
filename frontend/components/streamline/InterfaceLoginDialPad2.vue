<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="1.75" cy="1.75" r="1.75" />
            <circle cx="7" cy="1.75" r="1.75" />
            <circle cx="12.25" cy="1.75" r="1.75" />
            <circle cx="1.75" cy="7" r="1.75" />
            <circle cx="7" cy="7" r="1.75" />
            <circle cx="12.25" cy="7" r="1.75" />
            <circle cx="1.75" cy="12.25" r="1.75" />
            <circle cx="7" cy="12.25" r="1.75" />
            <circle cx="12.25" cy="12.25" r="1.75" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLoginDialPad2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
