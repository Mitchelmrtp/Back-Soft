// Notification controller - simple implementation
export const getNotifications = async (req, res) => {
    try {
        // Mock notifications for now - in real app, fetch from database
        const notifications = [
            {
                id: 1,
                title: 'Nuevo recurso disponible',
                message: 'Se ha publicado un nuevo recurso en tu categoría favorita',
                type: 'info',
                read: false,
                created_at: new Date(),
                user_id: req.user.userId
            },
            {
                id: 2,
                title: 'Recurso moderado',
                message: 'Tu recurso "Ejemplo" ha sido aprobado',
                type: 'success', 
                read: false,
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                user_id: req.user.userId
            }
        ];

        res.json({
            notifications,
            unread_count: notifications.filter(n => !n.read).length
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        // In a real app, update notification in database

        res.json({
            message: 'Notificación marcada como leída',
            notification_id: parseInt(id)
        });

    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        // In a real app, update all notifications for user in database

        res.json({
            message: 'Todas las notificaciones marcadas como leídas'
        });

    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};