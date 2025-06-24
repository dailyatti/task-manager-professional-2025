import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Link, Unlink, CheckCircle, AlertCircle, Key, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GoogleCalendarIntegration } from '../../utils/googleCalendar';
import type { GoogleCalendarConfig } from '../../types';

interface GoogleCalendarPanelProps {
  config: GoogleCalendarConfig;
  onConfigChange: (config: GoogleCalendarConfig) => void;
}

export function GoogleCalendarPanel({ config, onConfigChange }: GoogleCalendarPanelProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [calendarIntegration] = useState(() => new GoogleCalendarIntegration(config));

  const handleConnect = async () => {
    if (!apiKey.trim() || !clientId.trim()) {
      setMessage({ 
        type: 'error', 
        text: 'Kérlek add meg mind a Google API kulcsot, mind a Client ID-t!' 
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Temporarily set environment variables for this session
      (window as any).__GOOGLE_API_KEY__ = apiKey;
      (window as any).__GOOGLE_CLIENT_ID__ = clientId;

      const initialized = await calendarIntegration.initializeGoogleAPI();
      if (!initialized) {
        throw new Error('Nem sikerült inicializálni a Google API-t');
      }

      const signedIn = await calendarIntegration.signIn();
      if (signedIn) {
        onConfigChange({
          ...config,
          enabled: true,
        });
        setMessage({ type: 'success', text: 'Sikeresen csatlakozva a Google Calendar-hoz!' });
      } else {
        throw new Error('Nem sikerült bejelentkezni a Google-ba');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Nem sikerült csatlakozni a Google Calendar-hoz' 
      });
    } finally {
      setIsConnecting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDisconnect = () => {
    onConfigChange({
      enabled: false,
      calendarId: undefined,
      accessToken: undefined,
    });
    setMessage({ type: 'success', text: 'Lecsatlakozva a Google Calendar-ról' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCalendarIdChange = (calendarId: string) => {
    onConfigChange({
      ...config,
      calendarId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Google Calendar Integráció
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Szinkronizáld a feladataidat a Google Calendar-ral
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className={`flex items-center space-x-2 text-sm p-3 rounded-xl ${
          config.enabled
            ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
            : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {config.enabled ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Csatlakozva a Google Calendar-hoz</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Nincs csatlakozva a Google Calendar-hoz</span>
            </>
          )}
        </div>

        {/* Setup Instructions */}
        {!config.enabled && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-3">
              Beállítási útmutató
            </h4>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-400">
              <div>
                <p className="font-medium mb-1">1. Menj a Google Cloud Console-ra:</p>
                <a 
                  href="https://console.cloud.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 underline"
                >
                  console.cloud.google.com
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
              
              <div>
                <p className="font-medium mb-1">2. Hozz létre vagy válassz egy projektet</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">3. Engedélyezd a Google Calendar API-t:</p>
                <p>APIs & Services → Library → Google Calendar API → Enable</p>
                <p className="text-xs mt-1 text-orange-600 dark:text-orange-400">
                  ⚠️ Fontos: Győződj meg róla, hogy a Google Calendar API engedélyezve van a projektedben!
                </p>
              </div>
              
              <div>
                <p className="font-medium mb-1">4. Hozz létre hitelesítő adatokat:</p>
                <p>APIs & Services → Credentials → Create Credentials</p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>API Key (API kulcshoz) - Korlátozd a Google Calendar API-ra</li>
                  <li>OAuth 2.0 Client ID (Client ID-hoz, Web application típus)</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium mb-1">5. Konfiguráld az API kulcsot:</p>
                <p>API Key → Edit → API restrictions → Restrict key → Google Calendar API</p>
                <p className="text-xs mt-1 text-orange-600 dark:text-orange-400">
                  ⚠️ Az API kulcsot korlátozni kell a Google Calendar API-ra!
                </p>
              </div>
              
              <div>
                <p className="font-medium mb-1">6. Add hozzá a domain-t az OAuth beállításokhoz:</p>
                <p>Authorized JavaScript origins: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">http://localhost:5173</code></p>
              </div>
            </div>
          </div>
        )}

        {/* API Configuration */}
        {!config.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google API Key
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza... kezdetű API kulcs (Google Calendar API-ra korlátozva)"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Client ID
              </label>
              <div className="relative">
                <Input
                  type={showClientId ? 'text' : 'password'}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="...apps.googleusercontent.com végű Client ID"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowClientId(!showClientId)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Calendar ID Input */}
        {config.enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Naptár ID (opcionális)
            </label>
            <Input
              value={config.calendarId || ''}
              onChange={(e) => handleCalendarIdChange(e.target.value)}
              placeholder="primary (alapértelmezett) vagy a naptár ID-ja"
              helperText="Hagyd üresen az elsődleges naptár használatához"
            />
          </div>
        )}

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center space-x-2 text-sm p-3 rounded-xl ${
              message.type === 'success'
                ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                : 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Actions */}
        <div className="pt-4">
          {config.enabled ? (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full"
            >
              <Unlink className="w-4 h-4 mr-2" />
              Lecsatlakozás a Google Calendar-ról
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              isLoading={isConnecting}
              disabled={!apiKey.trim() || !clientId.trim()}
              className="w-full"
            >
              <Link className="w-4 h-4 mr-2" />
              Csatlakozás a Google Calendar-hoz
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}