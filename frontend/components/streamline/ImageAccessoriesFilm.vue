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
                d="M.75,14A.76.76,0,0,1,0,13.25V.75A.76.76,0,0,1,.75,0,.76.76,0,0,1,1.5.75v12.5A.76.76,0,0,1,.75,14Z"
            />
            <path
                d="M13.25,14a.76.76,0,0,1-.75-.75V.75a.75.75,0,0,1,1.5,0v12.5A.76.76,0,0,1,13.25,14Z"
            />
            <rect x="3.5" y="0.5" width="7" height="5" rx="1" />
            <rect x="3.5" y="8.5" width="7" height="5" rx="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ImageAccessoriesFilm',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
