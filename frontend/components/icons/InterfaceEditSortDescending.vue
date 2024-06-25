<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clip-path="url(#clip0_1698_781)">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.25001 10C8.9617 10 8.69892 10.1653 8.57403 10.4251C8.44914 10.685 8.48425 10.9934 8.66436 11.2185L10.6644 13.7185C10.8067 13.8964 11.0222 14 11.25 14C11.4778 14 11.6933 13.8964 11.8357 13.7185L13.8357 11.2185C14.0158 10.9934 14.0509 10.685 13.926 10.4251C13.8011 10.1653 13.5383 10 13.25 10H12.25V1C12.25 0.447716 11.8023 0 11.25 0C10.6977 0 10.25 0.447716 10.25 1V10H9.25001Z"
                fill="currentColor"
            />
            <path
                d="M1 4.25C1 3.83579 1.33579 3.5 1.75 3.5H8.25C8.66421 3.5 9 3.83579 9 4.25C9 4.66421 8.66421 5 8.25 5H1.75C1.33579 5 1 4.66421 1 4.25Z"
                fill="currentColor"
            />
            <path
                d="M1 10.25C1 9.83579 1.33579 9.5 1.75 9.5H6.25C6.66421 9.5 7 9.83579 7 10.25C7 10.6642 6.66421 11 6.25 11H1.75C1.33579 11 1 10.6642 1 10.25Z"
                fill="currentColor"
            />
            <path
                d="M1.75 6.5C1.33579 6.5 1 6.83579 1 7.25C1 7.66421 1.33579 8 1.75 8H8.25C8.66421 8 9 7.66421 9 7.25C9 6.83579 8.66421 6.5 8.25 6.5H1.75Z"
                fill="currentColor"
            />
        </g>
        <defs>
            <clipPath id="clip0_1698_781">
                <rect width="14" height="14" fill="white" />
            </clipPath>
        </defs>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditSortDescending',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
