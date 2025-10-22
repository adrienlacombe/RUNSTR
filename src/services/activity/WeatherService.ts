/**
 * WeatherService - Fetch weather conditions for workouts
 * Uses OpenWeather API to get temperature, conditions, and description
 */

export interface WeatherConditions {
  temp: number; // Temperature in Celsius
  feelsLike: number; // Feels like temperature in Celsius
  description: string; // e.g., "Clear sky", "Light rain"
  icon: string; // Weather icon code (e.g., "01d" for clear sky day)
  humidity: number; // Humidity percentage
  windSpeed: number; // Wind speed in m/s
}

class WeatherService {
  private static instance: WeatherService;

  // OpenWeather API key - should be in environment variables
  // For MVP, using a placeholder - replace with actual key
  private readonly API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // TODO: Move to env
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  private constructor() {}

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Fetch weather conditions for a specific location and time
   * Note: OpenWeather free tier only supports current weather, not historical
   * For MVP, we'll fetch current conditions as approximation
   */
  async getWeatherForWorkout(
    latitude: number,
    longitude: number,
    timestamp?: number // Optional - for future historical data support
  ): Promise<WeatherConditions | null> {
    try {
      // For MVP, check if API key is configured
      if (!this.API_KEY || this.API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        console.warn('[WeatherService] API key not configured, skipping weather fetch');
        return null;
      }

      const url = `${this.BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${this.API_KEY}&units=metric`;

      console.log(`[WeatherService] Fetching weather for ${latitude}, ${longitude}`);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[WeatherService] API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      const weather: WeatherConditions = {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0]?.description || 'Unknown',
        icon: data.weather[0]?.icon || '01d',
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };

      console.log(`[WeatherService] ✅ Weather fetched: ${weather.temp}°C, ${weather.description}`);

      return weather;
    } catch (error) {
      console.error('[WeatherService] Failed to fetch weather:', error);
      return null;
    }
  }

  /**
   * Get weather icon emoji for display
   */
  getWeatherEmoji(icon: string): string {
    // Map OpenWeather icon codes to emojis
    const iconMap: Record<string, string> = {
      '01d': '☀️', // Clear sky day
      '01n': '🌙', // Clear sky night
      '02d': '⛅', // Few clouds day
      '02n': '☁️', // Few clouds night
      '03d': '☁️', // Scattered clouds
      '03n': '☁️',
      '04d': '☁️', // Broken clouds
      '04n': '☁️',
      '09d': '🌧️', // Shower rain
      '09n': '🌧️',
      '10d': '🌦️', // Rain day
      '10n': '🌧️', // Rain night
      '11d': '⛈️', // Thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // Snow
      '13n': '❄️',
      '50d': '🌫️', // Mist
      '50n': '🌫️',
    };

    return iconMap[icon] || '🌤️';
  }

  /**
   * Format temperature for display (supports Celsius/Fahrenheit)
   */
  formatTemperature(tempCelsius: number, unit: 'C' | 'F' = 'C'): string {
    if (unit === 'F') {
      const tempF = (tempCelsius * 9/5) + 32;
      return `${Math.round(tempF)}°F`;
    }
    return `${tempCelsius}°C`;
  }

  /**
   * Get weather description for display
   */
  formatWeatherBadge(conditions: WeatherConditions, unit: 'C' | 'F' = 'C'): string {
    const emoji = this.getWeatherEmoji(conditions.icon);
    const temp = this.formatTemperature(conditions.temp, unit);
    return `${emoji} ${temp}`;
  }
}

export const weatherService = WeatherService.getInstance();
export default weatherService;
