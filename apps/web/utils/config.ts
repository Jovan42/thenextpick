import { AppConfig, defaultConfig } from '../types/config';

let appConfig: AppConfig | null = null;

export const loadConfig = async (): Promise<AppConfig> => {
  if (appConfig) {
    return appConfig;
  }

  try {
    // First try to load from local config file
    const localResponse = await fetch('/config.json');
    if (localResponse.ok) {
      const localConfig = await localResponse.json();
      appConfig = { ...defaultConfig, ...localConfig };
      return appConfig;
    }
  } catch (error) {
    console.warn('Failed to load local config, trying API:', error);
  }

  try {
    // Fallback to API config
    const response = await fetch('https://thenextpick-api.onrender.com/api/config');
    if (!response.ok) {
      throw new Error('Failed to load config from API');
    }
    const config = await response.json();
    appConfig = { ...defaultConfig, ...config };
    return appConfig;
  } catch (error) {
    console.warn('Failed to load config from API, using default config:', error);
    appConfig = defaultConfig;
    return appConfig;
  }
};

export const getConfig = (): AppConfig => {
  if (!appConfig) {
    return defaultConfig;
  }
  return appConfig;
};

export const getSuggestionCount = (): number => {
  return getConfig().suggestions.defaultCount;
};

export const getMinSuggestionCount = (): number => {
  return getConfig().suggestions.minCount;
};

export const getMaxSuggestionCount = (): number => {
  return getConfig().suggestions.maxCount;
};

export const getVotingPoints = (): number[] => {
  return getConfig().voting.pointSystem.points;
};

export const getVotingPointCount = (): number => {
  return getConfig().voting.pointSystem.points.length;
};

export const getApiBaseUrl = (): string => {
  return getConfig().api.baseUrl;
};
