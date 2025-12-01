// 👀 Profile Observer - Observer Pattern implementation
// Following Observer Pattern to handle profile change notifications

import NotificationContext from '../patterns/NotificationStrategy.js';

class ProfileObserver {
  constructor() {
    this.observers = new Map();
  }

  /**
   * Subscribe to profile events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  subscribe(event, callback) {
    if (!this.observers.has(event)) {
      this.observers.set(event, []);
    }
    this.observers.get(event).push(callback);
  }

  /**
   * Unsubscribe from profile events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  unsubscribe(event, callback) {
    if (this.observers.has(event)) {
      const callbacks = this.observers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify all subscribers of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  async notify(event, data) {
    if (this.observers.has(event)) {
      const callbacks = this.observers.get(event);
      for (const callback of callbacks) {
        try {
          await callback(data);
        } catch (error) {
          console.error(`Error in observer callback for event ${event}:`, error);
        }
      }
    }
  }
}

// Create singleton instance
const profileObserver = new ProfileObserver();

// Subscribe to profile events with Strategy Pattern integration
profileObserver.subscribe('profile.updated', async (data) => {
  console.log('📝 Profile updated:', {
    userId: data.userId,
    changes: data.changes,
    timestamp: new Date().toISOString()
  });
  
  // Send notification using Strategy Pattern
  const notificationData = {
    user: data.newData,
    subject: 'Perfil Actualizado',
    title: 'Perfil Actualizado',
    message: 'Tu perfil ha sido actualizado exitosamente',
    body: 'Los cambios en tu perfil han sido guardados',
    type: 'profile_update',
    templateData: {
      changes: data.changes,
      userName: data.newData.name
    }
  };
  
  // Send in-app notification
  await NotificationContext.sendNotification('inapp', notificationData);
});

profileObserver.subscribe('avatar.updated', async (data) => {
  console.log('🖼️ Avatar updated:', {
    userId: data.userId,
    oldAvatar: data.oldAvatar,
    newAvatar: data.newAvatar,
    timestamp: new Date().toISOString()
  });
  
  // Get user data for notification (you might need to fetch this)
  const notificationData = {
    user: { id: data.userId }, // In real scenario, fetch full user data
    title: 'Avatar Actualizado',
    message: 'Tu foto de perfil ha sido actualizada',
    body: 'Tu nueva foto de perfil ya está disponible',
    type: 'avatar_update'
  };
  
  // Send notification
  await NotificationContext.sendNotification('inapp', notificationData);
  
  // Here you could also trigger additional actions like:
  // - Generate thumbnails
  // - Update CDN
  // - Clean old files
});

profileObserver.subscribe('password.changed', async (data) => {
  console.log('🔒 Password changed:', {
    userId: data.userId,
    timestamp: new Date().toISOString()
  });
  
  // Security-related notification - send via multiple channels
  const notificationData = {
    user: { id: data.userId }, // In real scenario, fetch full user data
    subject: 'Contraseña Cambiada - Alerta de Seguridad',
    title: 'Contraseña Cambiada',
    message: 'Tu contraseña ha sido cambiada exitosamente',
    body: 'Si no fuiste tú quien cambió la contraseña, contacta al soporte',
    type: 'security_alert'
  };
  
  // Send via multiple channels for security alerts
  await NotificationContext.sendMultiple(['inapp', 'email'], notificationData);
  
  // Here you could also:
  // - Log security event
  // - Invalidate other sessions
  // - Require re-authentication
});

export default profileObserver;