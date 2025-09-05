export interface AppConfig {
  api: {
    baseUrl: string;
  };
  suggestions: {
    minCount: number;
    maxCount: number;
    defaultCount: number;
  };
  voting: {
    pointSystem: {
      enabled: boolean;
      points: number[];
    };
  };
  ui: {
    theme: {
      primaryColor: string;
      successColor: string;
      warningColor: string;
      dangerColor: string;
    };
  };
}

export const defaultConfig: AppConfig = {
  api: {
    baseUrl: "http://localhost:8080"
  },
  suggestions: {
    minCount: 3,
    maxCount: 5,
    defaultCount: 3
  },
  voting: {
    pointSystem: {
      enabled: true,
      points: [3, 2, 1]
    }
  },
  ui: {
    theme: {
      primaryColor: "#007bff",
      successColor: "#28a745",
      warningColor: "#ffc107",
      dangerColor: "#dc3545"
    }
  }
};
