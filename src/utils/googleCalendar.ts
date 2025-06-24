import type { Task, GoogleCalendarConfig } from '../types';

export class GoogleCalendarIntegration {
  private config: GoogleCalendarConfig;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
  }

  async initializeGoogleAPI(): Promise<boolean> {
    try {
      // Check if required credentials are available (either from window or env)
      const apiKey = (window as Window & { __GOOGLE_API_KEY__?: string }).__GOOGLE_API_KEY__ || import.meta.env.VITE_GOOGLE_API_KEY;
      const clientId = (window as Window & { __GOOGLE_CLIENT_ID__?: string }).__GOOGLE_CLIENT_ID__ || import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!apiKey || !clientId || apiKey === 'your_google_api_key_here' || clientId === 'your_google_client_id_here') {
        throw new Error('Google API credentials are not configured. Please provide both Google API Key and Client ID.');
      }

      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPIScript();
      }

      await new Promise<void>((resolve) => {
        window.gapi.load('client:auth2', () => resolve());
      });

      // Check if gapi.client is already initialized
      if (!window.gapi.client || !window.gapi.client.calendar) {
        await window.gapi.client.init({
          apiKey: apiKey,
          clientId: clientId,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar'
        });
      }

      // Check if auth2 is already initialized before calling init
      let authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        authInstance = await window.gapi.auth2.init({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/calendar'
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      return false;
    }
  }

  private loadGoogleAPIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        throw new Error('Google Auth instance is not initialized');
      }
      
      const user = await authInstance.signIn();
      this.config.accessToken = user.getAuthResponse().access_token;
      return true;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  async createEvent(task: Task, date?: Date): Promise<string | null> {
    if (!this.config.enabled || !this.config.accessToken) {
      return null;
    }

    try {
      const event = {
        summary: task.text,
        description: task.subtasks.map(st => `• ${st.text}`).join('\n'),
        start: {
          dateTime: date ? date.toISOString() : new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: date ? new Date(date.getTime() + 60 * 60 * 1000).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: this.config.calendarId || 'primary',
        resource: event,
      });

      return response.result.id;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return null;
    }
  }

  async updateEvent(eventId: string, task: Task): Promise<boolean> {
    if (!this.config.enabled || !this.config.accessToken) {
      return false;
    }

    try {
      await window.gapi.client.calendar.events.patch({
        calendarId: this.config.calendarId || 'primary',
        eventId: eventId,
        resource: {
          summary: task.text,
          description: task.subtasks.map(st => `• ${st.text}`).join('\n'),
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.config.enabled || !this.config.accessToken) {
      return false;
    }

    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: this.config.calendarId || 'primary',
        eventId: eventId,
      });

      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  }
}

// Global type declaration for Google API
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: Record<string, unknown>) => Promise<void>;
        calendar: {
          events: {
            insert: (params: Record<string, unknown>) => Promise<{ result: { id: string } }>;
            patch: (params: Record<string, unknown>) => Promise<void>;
            delete: (params: Record<string, unknown>) => Promise<void>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          signIn: () => Promise<{ getAuthResponse: () => { access_token: string } }>;
        };
        init: (config: Record<string, unknown>) => Promise<{
          signIn: () => Promise<{ getAuthResponse: () => { access_token: string } }>;
        }>;
      };
    };
  }
}