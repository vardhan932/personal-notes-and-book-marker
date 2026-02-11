// Notification utility functions

// Track scheduled timers to avoid duplicates
let scheduledTimers = new Map();

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser doesn't support notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const showNotification = async (title, body, tag = 'linkvault-test') => {
    // Check for Secure Context (HTTPS or localhost)
    if (!window.isSecureContext) {
        console.error("Notifications require a secure context (HTTPS or localhost)");
        return;
    }

    if (Notification.permission !== "granted") return;

    const options = {
        body: body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        vibrate: [200, 100, 200],
        tag: tag,
        renotify: true
    };

    // Try using service worker registration first (required for many mobile browsers)
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration && registration.showNotification) {
                await registration.showNotification(title, options);
                return;
            }
        } catch (err) {
            console.error("Service worker notification error:", err);
        }
    }

    // Fallback to basic notification
    new Notification(title, options);
};

export const scheduleNotification = (note) => {
    if (!note.reminderDate || note.isDeleted) return;

    // Clear existing timer for this note if it exists
    if (scheduledTimers.has(note._id)) {
        clearTimeout(scheduledTimers.get(note._id));
        scheduledTimers.delete(note._id);
    }

    const reminderTime = new Date(note.reminderDate).getTime();
    const now = Date.now();
    const delay = reminderTime - now;

    // Only schedule if reminder is in the future
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Within 24 hours
        // console.log(`Scheduling notification for "${note.title}" in ${Math.round(delay / 1000)} seconds`);

        const timerId = setTimeout(() => {
            showNotification(
                `🔔 Reminder: ${note.title}`,
                note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
                `note-${note._id}`
            );
            scheduledTimers.delete(note._id);
        }, delay);

        scheduledTimers.set(note._id, timerId);
    }
};

export const scheduleAllNotifications = (notes) => {
    notes.forEach(note => scheduleNotification(note));
};
