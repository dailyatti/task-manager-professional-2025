import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Key, Save, Trash2, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AIConfig } from '../../types';
import { validateApiKey, KeyValidationResponse, AI_PROVIDERS } from '../../utils/aiProviders';

interface AIConfigPanelProps {
  config: AIConfig;
  onSave: (config: AIConfig) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const AIConfigPanel: React.FC<AIConfigPanelProps> = ({ config, onSave, t }) => {
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<KeyValidationResponse | null>(null);
  const [isKeyValidated, setIsKeyValidated] = useState(false); // Tracks if current key has been successfully validated
  const [isValidating, setIsValidating] = useState(false);

  // Reset validation status if provider or API key changes
  useEffect(() => {
    setValidationStatus(null);
    setIsKeyValidated(false);
  }, [localConfig.provider, localConfig.apiKey]);

  // Update localConfig when external config changes
  useEffect(() => {
    setLocalConfig(config);
    // If the loaded config is enabled and has an API key (or is Ollama/Grok), assume it was previously validated.
    // This provides a better UX by not forcing re-validation on every settings open if already active.
    if (config.enabled && (config.apiKey || config.provider === 'ollama' || config.provider === 'grok')) {
      setIsKeyValidated(true); 
    } else {
      setIsKeyValidated(false);
    }
  }, [config]);

  const handleProviderChange = (provider: AIConfig['provider']) => {
    setLocalConfig(prev => ({
      ...prev,
      provider,
      apiKey: '', // Clear API key when provider changes
      model: AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS]?.models[0] || '', // Set default model
    }));
  };

  const handleApiKeyChange = (apiKey: string) => {
    setLocalConfig(prev => ({
      ...prev,
      apiKey,
    }));
  };

  const handleModelChange = (model: string) => {
    setLocalConfig(prev => ({
      ...prev,
      model,
    }));
  };

  const handleValidateKey = async () => {
    setIsValidating(true);
    setValidationStatus(null);
    const response = await validateApiKey(localConfig);
    setValidationStatus(response);
    setIsValidating(false);
    if (response.success) {
      setIsKeyValidated(true);
    } else {
      setIsKeyValidated(false);
    }
  };

  const handleSave = () => {
    // For Ollama, "validation" means connection is active.
    // For Grok, validation is a placeholder, allow saving if key is present.
    // For other providers, key must be validated or empty (to disable).
    if (localConfig.provider !== 'ollama' && localConfig.provider !== 'grok' && localConfig.apiKey.trim() !== '' && !isKeyValidated) {
      setValidationStatus({ success: false, messageKey: 'error.mustValidateToEnable' });
      return;
    }

    const newConfig = {
      ...localConfig,
      // Enable AI if (key is validated) OR (it's Ollama and connection is active) OR (it's Grok and key is present) OR (key is empty, thus disabling)
      // Essentially, if a key is provided for a key-based provider, it MUST be validated to enable.
      // If no key is provided (or for Ollama/Grok), enabled status depends on other factors or user intent to disable.
      enabled: (isKeyValidated && localConfig.apiKey.trim() !== '') || 
               (localConfig.provider === 'ollama' && isKeyValidated) || // isKeyValidated for Ollama means connection active
               (localConfig.provider === 'grok' && localConfig.apiKey.trim() !== '') // Grok is placeholder
    };
    
    // If user explicitly clears API key for a provider that requires one, disable it.
    if (localConfig.apiKey.trim() === '' && localConfig.provider !== 'ollama') {
      newConfig.enabled = false;
    }

    onSave(newConfig);

    setValidationStatus({ 
      success: true, 
      messageKey: newConfig.enabled ? 'success.aiConfigSavedEnabled' : 'success.aiConfigSavedDisabled',
      messageParams: { providerName: localConfig.provider }
    });
    setTimeout(() => setValidationStatus(null), 4000);
  };

  const handleDisable = () => {
    const disabledConfig = { ...localConfig, enabled: false };
    onSave(disabledConfig);
    setValidationStatus({ success: true, messageKey: 'success.aiDisabled' });
    setIsKeyValidated(false); // Reset validation state as AI is now disabled
    setTimeout(() => setValidationStatus(null), 3000);
  };

  const currentProviderModels = AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS]?.models || [];
  const providerRequiresApiKey = localConfig.provider !== 'ollama';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('aiAssistant')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('configureAiProviders')}
          </p>
        </div>
      </div>

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('provider')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(AI_PROVIDERS).map(([providerKey, provider]) => (
            <button
              key={providerKey}
              onClick={() => handleProviderChange(providerKey as AIConfig['provider'])}
              className={`p-4 text-left rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                localConfig.provider === providerKey
                  ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="font-semibold text-sm">{provider.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {provider.description}
              </div>
              {provider.features && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {provider.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Info */}
      {localConfig.provider && AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS] && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS].name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS].description}
              </p>
              {AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS].features && (
                <div className="flex flex-wrap gap-2">
                  {AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS].features?.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS].website && (
              <a
                href={AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS].website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                {t('visitWebsite')}
              </a>
            )}
          </div>
        </div>
      )}

      {/* API Key Input and Validation Button (if provider is not Ollama) */}
      {providerRequiresApiKey && (
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('apiKey')} ({AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS].name})
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={localConfig.apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={t('enterApiKeyFor', { providerName: AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS].name })}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                aria-label={showApiKey ? t('hideApiKey') : t('showApiKey')}
              >
                {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <Button
              onClick={handleValidateKey}
              disabled={isValidating || !localConfig.apiKey.trim()}
              variant="outline"
              className="whitespace-nowrap"
            >
              {isValidating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {t('validateKey')}
            </Button>
          </div>
        </div>
      )}
      
      {/* Ollama specific validation button (no API key needed) */}
      {localConfig.provider === 'ollama' && (
         <div>
          <Button
            onClick={handleValidateKey}
            disabled={isValidating}
            variant="outline"
            className="w-full"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {t('validateOllamaConnection')}
          </Button>
        </div>
      )}

      {/* Model Selection */}
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('model')}
        </label>
        <select
          id="model"
          value={localConfig.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {currentProviderModels.map((model) => {
            const provider = AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS];
            const pricing = provider?.pricing?.[model];
            const priceInfo = pricing ? ` ($${pricing.input}/${pricing.output})` : '';
            
            return (
              <option key={model} value={model}>
                {model}{priceInfo}
              </option>
            );
          })}
        </select>
        {localConfig.model && AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS]?.pricing?.[localConfig.model] && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('pricingInfo', {
              input: AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS]?.pricing?.[localConfig.model]?.input,
              output: AI_PROVIDERS[localConfig.provider as keyof typeof AI_PROVIDERS]?.pricing?.[localConfig.model]?.output
            })}
          </p>
        )}
      </div>

      {/* Validation Status Message */}
      {validationStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center space-x-2 text-sm p-3 rounded-xl ${
            validationStatus.success
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {validationStatus.success ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="break-words">{t(validationStatus.messageKey, validationStatus.messageParams)}</span>
        </motion.div>
      )}

      {/* Current AI Status */}
      <div className={`flex items-center space-x-2 text-sm p-3 rounded-xl ${
        config.enabled && (isKeyValidated || localConfig.provider === 'ollama' || localConfig.provider === 'grok')
          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300'
      }`}>
        {config.enabled && (isKeyValidated || localConfig.provider === 'ollama' || localConfig.provider === 'grok') ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>{t('aiAssistantActiveFor', { providerName: AI_PROVIDERS[config.provider as keyof typeof AI_PROVIDERS]?.name || config.provider })}</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>{t('aiAssistantNotActiveOrNotValidated')}</span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <Button
          onClick={handleSave}
          className="flex-1"
          disabled={isValidating || (providerRequiresApiKey && localConfig.apiKey.trim() !== '' && !isKeyValidated && localConfig.provider !== 'grok')}
        >
          <Save className="w-4 h-4 mr-2" />
          {t('saveAndEnable')}
        </Button>
        
        {config.enabled && (
          <Button
            onClick={handleDisable}
            variant="danger_outline" // Assuming this variant exists or create it
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('disableAI')}
          </Button>
        )}
      </div>
      
      {localConfig.provider === 'deepseek' && AI_PROVIDERS.deepseek.note && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          {AI_PROVIDERS.deepseek.note} <br/>
          {t('deepseekOffPeakInfo', { hours: AI_PROVIDERS.deepseek.pricing?.['deepseek-chat']?.offPeakHours || 'N/A' })}
        </p>
      )}

    </motion.div>
  );
}