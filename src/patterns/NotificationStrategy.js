// 🎯 Notification Strategy - Strategy Pattern implementation
// Following Strategy Pattern for different notification types

class NotificationStrategy {
  /**
   * Send notification
   * @param {Object} data - Notification data
   */
  async send(data) {
    throw new Error('Method send must be implemented by subclass');
  }
}

// Email notification strategy
class EmailNotificationStrategy extends NotificationStrategy {
  async send(data) {
    console.log('📧 Sending email notification:', {
      to: data.user.email,
      subject: data.subject,
      message: data.message,
      timestamp: new Date().toISOString()
    });
    
    // Here you would integrate with email service like SendGrid, Nodemailer, etc.
    // await emailService.send({
    //   to: data.user.email,
    //   subject: data.subject,
    //   template: data.template,
    //   data: data.templateData
    // });
  }
}

// Push notification strategy
class PushNotificationStrategy extends NotificationStrategy {
  async send(data) {
    console.log('🔔 Sending push notification:', {
      userId: data.user.id,
      title: data.title,
      body: data.body,
      timestamp: new Date().toISOString()
    });
    
    // Here you would integrate with push service like Firebase, OneSignal, etc.
    // await pushService.send({
    //   userId: data.user.id,
    //   title: data.title,
    //   body: data.body,
    //   data: data.customData
    // });
  }
}

// In-app notification strategy
class InAppNotificationStrategy extends NotificationStrategy {
  async send(data) {
    console.log('💬 Creating in-app notification:', {
      userId: data.user.id,
      type: data.type,
      message: data.message,
      timestamp: new Date().toISOString()
    });
    
    // Here you would save to database or send via WebSocket
    // await notificationRepository.create({
    //   user_id: data.user.id,
    //   type: data.type,
    //   title: data.title,
    //   message: data.message,
    //   read: false
    // });
  }
}

// SMS notification strategy
class SMSNotificationStrategy extends NotificationStrategy {
  async send(data) {
    if (!data.user.phone) {
      console.warn('Cannot send SMS: User has no phone number');
      return;
    }
    
    console.log('📱 Sending SMS notification:', {
      to: data.user.phone,
      message: data.message,
      timestamp: new Date().toISOString()
    });
    
    // Here you would integrate with SMS service like Twilio, AWS SNS, etc.
    // await smsService.send({
    //   to: data.user.phone,
    //   body: data.message
    // });
  }
}

// Notification context that uses strategies
class NotificationContext {
  constructor() {
    this.strategies = new Map();
    this.initializeStrategies();
  }

  initializeStrategies() {
    this.strategies.set('email', new EmailNotificationStrategy());
    this.strategies.set('push', new PushNotificationStrategy());
    this.strategies.set('inapp', new InAppNotificationStrategy());
    this.strategies.set('sms', new SMSNotificationStrategy());
  }

  /**
   * Send notification using specified strategy
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   */
  async sendNotification(type, data) {
    const strategy = this.strategies.get(type);
    
    if (!strategy) {
      throw new Error(`Unknown notification strategy: ${type}`);
    }
    
    try {
      await strategy.send(data);
    } catch (error) {
      console.error(`Error sending ${type} notification:`, error);
    }
  }

  /**
   * Send multiple notifications
   * @param {Array} types - Array of notification types
   * @param {Object} data - Notification data
   */
  async sendMultiple(types, data) {
    const promises = types.map(type => this.sendNotification(type, data));
    await Promise.allSettled(promises);
  }
}

export default new NotificationContext();
export { 
  EmailNotificationStrategy, 
  PushNotificationStrategy, 
  InAppNotificationStrategy,
  SMSNotificationStrategy 
};