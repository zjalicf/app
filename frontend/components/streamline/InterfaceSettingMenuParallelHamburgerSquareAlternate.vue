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
                d="M11.25,14H2.75A2.75,2.75,0,0,1,0,11.25V2.75A2.75,2.75,0,0,1,2.75,0h8.5A2.75,2.75,0,0,1,14,2.75v8.5A2.75,2.75,0,0,1,11.25,14ZM2.75,1.5A1.25,1.25,0,0,0,1.5,2.75v8.5A1.25,1.25,0,0,0,2.75,12.5h8.5a1.25,1.25,0,0,0,1.25-1.25V2.75A1.25,1.25,0,0,0,11.25,1.5Z"
            />
            <path
                d="M9.75,7.62H4.25a.62.62,0,1,1,0-1.24h5.5a.62.62,0,1,1,0,1.24Z"
            />
            <path
                d="M9.75,4.88H4.25a.63.63,0,0,1,0-1.26h5.5a.63.63,0,0,1,0,1.26Z"
            />
            <path
                d="M9.75,10.38H4.25a.63.63,0,0,1,0-1.26h5.5a.63.63,0,0,1,0,1.26Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingMenuParallelHamburgerSquareAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
