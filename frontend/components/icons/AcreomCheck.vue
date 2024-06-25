<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        :width="size"
        :height="size"
        preserveAspectRatio="xMidYMid meet"
    >
        <g transform="matrix(1,0,0,1,16.375,16.5)" opacity="1">
            <g transform="matrix(1,0,0,1,0,0)">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill-opacity="0"
                    stroke="currentColor"
                    stroke-opacity="1"
                    stroke-width="4"
                    d=" M-9.625,0.2409999966621399 C-9.625,0.2409999966621399 -3.1480000019073486,6.616000175476074 -3.1480000019073486,6.616000175476074 C-3.1480000019073486,6.616000175476074 8.10200023651123,-4.497000217437744 9.875,-6.303999900817871"
                ></path>
            </g>
        </g>
    </svg>
</template>
<script>
export default {
    name: 'AcreomCheck',
    props: {
        size: {
            type: String,
            required: false,
            default: '16',
        },
    },
};
</script>
