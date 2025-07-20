/**
 * Multi-channel Notification System for NADA
 * Handles in-app banners, push notifications, email/SMS integration
 */

interface NotificationChannel {
  type: 'in_app' | 'push' | 'email' | 'sms';
  enabled: boolean;
  config?: {
    email?: string;
    phone?: string;
    webhook_url?: string;
  };
}

interface NotificationPreferences {
  channels: NotificationChannel[];
  alert_types: {
    water_quality_critical: boolean;
    water_quality_warning: boolean;
    biodiversity_low: boolean;
    system_updates: boolean;
    daily_summary: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string; // "22:00"
    end_time: string;   // "06:00"
  };
  location?: {
    timezone: string;
  };
}

interface NotificationPayload {
  id: string;
  type: 'water_quality' | 'biodiversity' | 'system' | 'summary';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: any;
  farmer_recommendations?: string[];
  timestamp: string;
  expires_at?: string;
}

export class NotificationSystem {
  private readonly EMAIL_API_KEY: string;
  private readonly SMS_API_KEY: string;
  private readonly PUSH_API_KEY: string;

  constructor() {
    this.EMAIL_API_KEY = Deno.env.get('EMAIL_API_KEY') || '';
    this.SMS_API_KEY = Deno.env.get('SMS_API_KEY') || '';
    this.PUSH_API_KEY = Deno.env.get('PUSH_API_KEY') || '';
  }

  /**
   * Send notification through all enabled channels
   */
  async sendNotification(
    payload: NotificationPayload,
    preferences: NotificationPreferences,
    userId?: string
  ): Promise<{
    sent: string[];
    failed: string[];
    in_quiet_hours: boolean;
  }> {
    console.log(`Sending notification: ${payload.title} (${payload.severity})`);

    const sent: string[] = [];
    const failed: string[] = [];

    // Check if we're in quiet hours
    const inQuietHours = this.isInQuietHours(preferences);
    if (inQuietHours && payload.severity !== 'critical') {
      console.log('Notification delayed due to quiet hours');
      return { sent, failed, in_quiet_hours: true };
    }

    // Check if this alert type is enabled
    if (!this.isAlertTypeEnabled(payload.type, preferences)) {
      console.log(`Notification type ${payload.type} is disabled`);
      return { sent, failed, in_quiet_hours: false };
    }

    // Send through each enabled channel
    for (const channel of preferences.channels) {
      if (!channel.enabled) continue;

      try {
        switch (channel.type) {
          case 'in_app':
            await this.sendInAppNotification(payload, userId);
            sent.push('in_app');
            break;

          case 'push':
            await this.sendPushNotification(payload, userId);
            sent.push('push');
            break;

          case 'email':
            if (channel.config?.email) {
              await this.sendEmailNotification(payload, channel.config.email);
              sent.push('email');
            }
            break;

          case 'sms':
            if (channel.config?.phone) {
              await this.sendSMSNotification(payload, channel.config.phone);
              sent.push('sms');
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel.type} notification:`, error);
        failed.push(channel.type);
      }
    }

    console.log(`Notification sent via: ${sent.join(', ')} | Failed: ${failed.join(', ')}`);
    return { sent, failed, in_quiet_hours: false };
  }

  /**
   * Send in-app notification (stored for UI to display)
   */
  private async sendInAppNotification(payload: NotificationPayload, userId?: string): Promise<void> {
    const notification = {
      ...payload,
      channel: 'in_app',
      user_id: userId,
      read: false,
      created_at: new Date().toISOString()
    };

    // Store in KV store for the UI to retrieve
    const key = userId ? `notifications:${userId}` : 'notifications:global';
    const existingNotifications = await kv.get(key) || [];
    
    // Add new notification to the beginning
    existingNotifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (existingNotifications.length > 50) {
      existingNotifications.splice(50);
    }

    await kv.set(key, existingNotifications);
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(payload: NotificationPayload, userId?: string): Promise<void> {
    if (!this.PUSH_API_KEY) {
      console.warn('Push notification API key not configured');
      return;
    }

    // In production, this would integrate with services like:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNs)
    // - OneSignal
    // - Pusher

    const pushPayload = {
      title: payload.title,
      body: payload.message,
      data: {
        type: payload.type,
        severity: payload.severity,
        ...payload.data
      },
      priority: payload.severity === 'critical' ? 'high' : 'normal'
    };

    console.log('Simulating push notification:', pushPayload);
    // await this.callPushAPI(pushPayload, userId);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(payload: NotificationPayload, email: string): Promise<void> {
    if (!this.EMAIL_API_KEY) {
      console.warn('Email API key not configured');
      return;
    }

    const emailContent = this.formatEmailContent(payload);
    
    // In production, integrate with email services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Postmark

    console.log(`Simulating email to ${email}:`, emailContent.subject);
    
    // Example SendGrid integration:
    /*
    const response = await fetch('https://api.sendgrid.v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject: emailContent.subject
        }],
        from: { email: 'alerts@nada-app.com', name: 'NADA Water Quality Alerts' },
        content: [{
          type: 'text/html',
          value: emailContent.html
        }]
      })
    });
    */
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(payload: NotificationPayload, phone: string): Promise<void> {
    if (!this.SMS_API_KEY) {
      console.warn('SMS API key not configured');
      return;
    }

    const smsContent = this.formatSMSContent(payload);
    
    // In production, integrate with SMS services like:
    // - Twilio
    // - AWS SNS
    // - MessageBird
    // - Nexmo

    console.log(`Simulating SMS to ${phone}:`, smsContent);
    
    // Example Twilio integration:
    /*
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${ACCOUNT_SID}:${this.SMS_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: phone,
        From: '+1234567890', // Your Twilio number
        Body: smsContent
      })
    });
    */
  }

  /**
   * Format email content for different alert types
   */
  private formatEmailContent(payload: NotificationPayload): { subject: string; html: string } {
    const subject = `[NADA Alert] ${payload.title}`;
    
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: ${this.getSeverityColor(payload.severity)};">
              🐸 ${payload.title}
            </h2>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Message:</strong> ${payload.message}</p>
              <p><strong>Time:</strong> ${new Date(payload.timestamp).toLocaleString()}</p>
              <p><strong>Severity:</strong> ${payload.severity.toUpperCase()}</p>
            </div>

            ${payload.farmer_recommendations ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">🌾 Recommendations for Farmers:</h3>
              <ul style="color: #2d5a2d;">
                ${payload.farmer_recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              <p>This alert was sent by NADA (Natural Acoustic Diagnostics & Alerts)</p>
              <p>Visit your NADA dashboard for more details and historical data.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Format SMS content (keeping it short and actionable)
   */
  private formatSMSContent(payload: NotificationPayload): string {
    const prefix = payload.severity === 'critical' ? '🚨 CRITICAL' : 
                   payload.severity === 'high' ? '⚠️ ALERT' : 
                   '📊 NADA';

    let message = `${prefix}: ${payload.title}\n\n${payload.message}`;

    // Add top recommendation for critical alerts
    if (payload.severity === 'critical' && payload.farmer_recommendations?.[0]) {
      message += `\n\nACTION: ${payload.farmer_recommendations[0]}`;
    }

    message += `\n\nCheck NADA app for details.`;

    // Keep SMS under 160 characters if possible
    if (message.length > 160) {
      message = `${prefix}: ${payload.title}\n\n${payload.message}\n\nCheck NADA app for full details.`;
    }

    return message;
  }

  /**
   * Get severity color for styling
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#1976d2';
      case 'low': return '#388e3c';
      default: return '#666666';
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quiet_hours.start_time.split(':').map(Number);
    const [endHour, endMin] = preferences.quiet_hours.end_time.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 06:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  /**
   * Check if alert type is enabled in preferences
   */
  private isAlertTypeEnabled(alertType: string, preferences: NotificationPreferences): boolean {
    switch (alertType) {
      case 'water_quality':
        return preferences.alert_types.water_quality_critical || preferences.alert_types.water_quality_warning;
      case 'biodiversity':
        return preferences.alert_types.biodiversity_low;
      case 'system':
        return preferences.alert_types.system_updates;
      case 'summary':
        return preferences.alert_types.daily_summary;
      default:
        return true; // Enable unknown types by default
    }
  }

  /**
   * Create default notification preferences
   */
  static createDefaultPreferences(): NotificationPreferences {
    return {
      channels: [
        { type: 'in_app', enabled: true },
        { type: 'push', enabled: false },
        { type: 'email', enabled: false },
        { type: 'sms', enabled: false }
      ],
      alert_types: {
        water_quality_critical: true,
        water_quality_warning: true,
        biodiversity_low: true,
        system_updates: false,
        daily_summary: false
      },
      quiet_hours: {
        enabled: true,
        start_time: "22:00",
        end_time: "06:00"
      }
    };
  }
}

// Import KV store for notification storage
import * as kv from './kv_store.tsx';