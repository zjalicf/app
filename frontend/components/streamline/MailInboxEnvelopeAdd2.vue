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
                d="M5.17,9a5.24,5.24,0,0,1,5.08-4A5.32,5.32,0,0,1,12,5.32h0V1.5A1.5,1.5,0,0,0,10.5,0h-9A1.5,1.5,0,0,0,0,1.5v6A1.5,1.5,0,0,0,1.5,9ZM1.61,1.86a.75.75,0,0,1,1-.25L5.87,3.55a.24.24,0,0,0,.26,0L9.36,1.61a.75.75,0,1,1,.78,1.28L6.39,5.14a.75.75,0,0,1-.78,0L1.86,2.89A.75.75,0,0,1,1.61,1.86Z"
            />
            <path
                d="M10.25,6.5A3.75,3.75,0,1,0,14,10.25,3.75,3.75,0,0,0,10.25,6.5Zm2.37,3.75a.63.63,0,0,1-.62.63h-.88a.24.24,0,0,0-.24.24V12a.63.63,0,0,1-1.26,0v-.88a.24.24,0,0,0-.24-.24H8.5a.63.63,0,0,1,0-1.26h.88a.24.24,0,0,0,.24-.24V8.5a.63.63,0,0,1,1.26,0v.88a.24.24,0,0,0,.24.24H12A.63.63,0,0,1,12.62,10.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailInboxEnvelopeAdd2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
