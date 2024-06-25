<template>
    <div class="notification-container">
        <transition-group name="notification-list" tag="div">
            <component
                :is="notification.component"
                v-for="(notification, index) in api.notifications"
                :key="notification.id"
                class="notification-list-move"
                v-bind="notification.bind"
                @close="close(index, $event)"
                @fireShortcut="fireShortcut(index, $event)"
            >
            </component>
        </transition-group>
    </div>
</template>

<script>
export default {
    data() {
        return {};
    },
    watch: {
        'api.notifications': {
            handler(newValue) {
                for (const [index, { shortcutKeybind }] of newValue.entries()) {
                    if (!shortcutKeybind) return;
                    if (
                        this.$shortcutsManager.isShortcutRegistered(
                            shortcutKeybind,
                        )
                    )
                        return;
                    this.$shortcutsManager.registerShortcut(
                        shortcutKeybind,
                        () => this.fireShortcut(index),
                    );
                }
                if (
                    !newValue.some(({ shortcutKeybind }) => !!shortcutKeybind)
                ) {
                    this.$shortcutsManager.disableNamespace('notifications');
                } else {
                    this.$shortcutsManager.enableNamespace('notifications');
                }
            },
            immediate: true,
            deep: true,
        },
    },
    methods: {
        async fireShortcut(index) {
            const shortcutNotifications = this.api.notifications
                .filter(notification => notification.shortcutFn)
                .map((_notification, index) => index);
            if (index === Math.min(...shortcutNotifications)) {
                await this.api.notifications[index].shortcutFn();
                this.close(index, null);
            }
        },
        close(index, id) {
            const options = this.api.notifications[index];
            if (options.onClose) {
                options.onClose(id);
            }
            if (options.shortcutKeybind) {
                this.$shortcutsManager.removeShortcut(options.shortcutKeybind);
            }
            this.api.notifications = this.api.notifications.filter(
                (_opts, idx) => idx !== index,
            );
        },
    },
};
</script>
<style scoped>
.notification-container {
    z-index: 2;
    position: absolute;
    right: 15px;
    bottom: 16px;
}

.notification-list-enter-active,
.notification-list-leave-active {
    position: relative;
    bottom: 0;
    right: 0;
    transform: scale(100%);
    transform-origin: right;
}

.notification-list-enter,
.notification-list-leave-to {
    transform: scale(90%) translateX(10px);
    transform-origin: right;
    opacity: 0;
}

.notification-list-enter-to,
.notification-list-leave {
    opacity: 1;
}

.notification-list-enter-active {
    transition: opacity 0.2s cubic-bezier(0.65, 0, 0.35, 1),
        transform 0.2s cubic-bezier(0.33, 1, 0.68, 1);
}

.notification-list-leave-active {
    transition: opacity 0.2s cubic-bezier(0.65, 0, 0.35, 1),
        transform 0.2s cubic-bezier(0.32, 0, 0.67, 0);
    position: absolute;
}

.notification-list-move {
    transition: all 0.15s ease-in-out;
}
</style>
