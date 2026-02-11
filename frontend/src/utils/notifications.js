// Notification utility functions

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

export const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: '/vite.svg',
            badge: '/vite.svg',
            vibrate: [200, 100, 200],
            tag: 'linkvault-reminder'
        });
    }
};

export const scheduleNotification = (note) => {
    if (!note.reminderDate) return;

    const reminderTime = new Date(note.reminderDate).getTime();
    const now = Date.now();
    const delay = reminderTime - now;

    // Only schedule if reminder is in the future
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Within 24 hours
        console.log(`Scheduling notification for "${note.title}" in ${Math.round(delay / 1000)} seconds`);

        setTimeout(() => {
            showNotification(
                `🔔 Reminder: ${note.title}`,
                note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')
            );
        }, delay);
    }
};

export const scheduleAllNotifications = (notes) => {
    notes.forEach(note => {
        if (note.reminderDate && !note.isDeleted) {
            scheduleNotification(note);
        }
    });
};
