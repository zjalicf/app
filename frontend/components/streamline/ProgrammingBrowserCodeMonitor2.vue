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
                d="M14,2.75A1.76,1.76,0,0,0,12.25,1H1.75A1.76,1.76,0,0,0,0,2.75v6.5A1.76,1.76,0,0,0,1.75,11H5a.26.26,0,0,1,.21.11.29.29,0,0,1,0,.24L4.56,13a.75.75,0,0,0,.69,1h3.5a.75.75,0,0,0,.69-1l-.67-1.61a.29.29,0,0,1,0-.24A.26.26,0,0,1,9,11h3.25A1.76,1.76,0,0,0,14,9.25Zm-1.5,0v3a.25.25,0,0,1-.15.23.25.25,0,0,1-.26,0l-.67-.58a2.63,2.63,0,0,0-3.35,0,.15.15,0,0,1-.13,0,.11.11,0,0,1-.06-.11V2.75a.25.25,0,0,1,.24-.25h4.13A.25.25,0,0,1,12.5,2.75ZM1.75,9.5a.25.25,0,0,1-.25-.25V2.75a.25.25,0,0,1,.25-.25H6.38a.25.25,0,0,1,.24.25v6.5a.25.25,0,0,1-.24.25Zm10.5,0H8.12a.25.25,0,0,1-.24-.25V7.17A.22.22,0,0,1,8,7l.88-.71a1.37,1.37,0,0,1,1.75,0l1.81,1.56a.22.22,0,0,1,.09.19v1.2A.25.25,0,0,1,12.25,9.5Z"
            />
            <path d="M5,4.12H3.25a.63.63,0,0,0,0,1.26H5A.63.63,0,0,0,5,4.12Z" />
            <path
                d="M4.25,6.62h-1a.63.63,0,0,0,0,1.26h1a.63.63,0,0,0,0-1.26Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingBrowserCodeMonitor2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
