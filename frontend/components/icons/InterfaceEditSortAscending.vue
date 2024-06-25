<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clip-path="url(#clip0_1698_777)">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.75 11C1.33579 11 1 10.6642 1 10.25C1 9.83579 1.33579 9.5 1.75 9.5H8.25C8.66421 9.5 9 9.83579 9 10.25C9 10.6642 8.66421 11 8.25 11H1.75ZM9.25001 4C8.9617 4 8.69892 3.8347 8.57403 3.5749C8.44914 3.315 8.48425 3.0066 8.66436 2.7815L10.6644 0.2815C10.8067 0.1036 11.0222 0 11.25 0C11.4778 0 11.6933 0.1036 11.8357 0.2815L13.8357 2.7815C14.0158 3.0066 14.0509 3.315 13.926 3.5749C13.8011 3.8347 13.5383 4 13.25 4H12.25V13C12.25 13.5523 11.8023 14 11.25 14C10.6977 14 10.25 13.5523 10.25 13V4H9.25001ZM1.75 5C1.33579 5 1 4.66421 1 4.25C1 3.83579 1.33579 3.5 1.75 3.5H6.25C6.66421 3.5 7 3.83579 7 4.25C7 4.66421 6.66421 5 6.25 5H1.75ZM1 7.25C1 7.66421 1.33579 8 1.75 8H8.25C8.66421 8 9 7.66421 9 7.25C9 6.83579 8.66421 6.5 8.25 6.5H1.75C1.33579 6.5 1 6.83579 1 7.25Z"
                fill="currentColor"
            />
        </g>
        <defs>
            <clipPath id="clip0_1698_777">
                <rect width="14" height="14" fill="white" />
            </clipPath>
        </defs>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditSortAscending',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
