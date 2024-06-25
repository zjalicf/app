<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect width="6" height="6" rx="1" />
            <rect x="8" width="6" height="6" rx="1" />
            <rect y="8" width="6" height="6" rx="1" />
            <path
                d="M12.24,11.18a.25.25,0,0,1,0-.36l1.54-1.54a.75.75,0,0,0-1.06-1.06L11.18,9.76a.25.25,0,0,1-.36,0L9.28,8.22A.75.75,0,0,0,8.22,9.28l1.54,1.54a.25.25,0,0,1,0,.36L8.22,12.72a.75.75,0,0,0,0,1.06.75.75,0,0,0,1.06,0l1.54-1.54a.25.25,0,0,1,.36,0l1.54,1.54a.75.75,0,0,0,1.06,0,.75.75,0,0,0,0-1.06Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingApplicationRemove',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
