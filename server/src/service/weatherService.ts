import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  constructor(
    public cityName: string,
    public date: string,
    public icon: string,
    public description: string,
    public temperature: number,
    public humidity: number,
    public windSpeed: number
  ) {}
}

// Complete the WeatherService class
class WeatherService {
  private baseURL = 'https://api.openweathermap.org/data/2.5';
  private apiKey = process.env.OPENWEATHER_API_KEY;

  // Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`
    );
    const data = await response.json();
    console.log('Location data:', data); // Log the location data
    return data;
  }

  // Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error('Location data is missing or invalid');
    }
    return {
      lat: locationData[0].lat,
      lon: locationData[0].lon,
    };
  }

  // Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/forecast?${this.buildWeatherQuery(coordinates)}`
    );
    const data = await response.json();
    console.log('Weather data:', data); // Log the weather data
    return data;
  }

  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    if (!response.list || response.list.length === 0) {
      throw new Error('Current weather data is missing');
    }
    const current = response.list[0];
    return new Weather(
      response.city.name,
      new Date(current.dt * 1000).toLocaleDateString(),
      current.weather[0].icon,
      current.weather[0].description,
      current.main.temp,
      current.main.humidity,
      current.wind.speed
    );
  }

  // Complete buildForecastArray method
  private buildForecastArray(weatherData: any): Weather[] {
    return weatherData.list.slice(1, 6).map((day: any) => {
      return new Weather(
        weatherData.city.name,
        new Date(day.dt * 1000).toLocaleDateString(),
        day.weather[0].icon,
        day.weather[0].description,
        day.main.temp,
        day.main.humidity,
        day.wind.speed
      );
    });
  }

  // Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(weatherData);
      return { current: currentWeather, forecast };
    } catch (error) {
      console.error('Error in getWeatherForCity:', error);
      throw error;
    }
  }
}

export default new WeatherService();