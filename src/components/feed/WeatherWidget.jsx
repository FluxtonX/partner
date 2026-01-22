import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, RefreshCw, AlertTriangle, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvokeLLM } from '@/api/integrations';

const WEATHER_CACHE_KEY = 'feed_weather_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour for main feed weather

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Try to get location and fetch weather on component mount
    fetchUserLocationWeather();
  }, []);

  const getCachedWeather = () => {
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          setLastUpdated(timestamp);
          return data;
        }
      }
    } catch (error) {
      console.warn('Error reading weather cache:', error);
    }
    return null;
  };

  const setCachedWeather = (data) => {
    try {
      const timestamp = Date.now();
      const cacheData = { data, timestamp };
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData));
      setLastUpdated(timestamp);
    } catch (error) {
      console.warn('Error writing weather cache:', error);
    }
  };

  const fetchUserLocationWeather = async (forceRefresh = false) => {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cachedWeather = getCachedWeather();
      if (cachedWeather) {
        setWeather(cachedWeather);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // First try to get user's location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
          },
          (geoError) => {
            console.warn('Geolocation error:', geoError);
            // Fallback to IP-based location
            fetchWeatherByIP();
          },
          { timeout: 10000, enableHighAccuracy: false }
        );
      } else {
        // Fallback to IP-based location
        fetchWeatherByIP();
      }
    } catch (error) {
      console.error('Error in fetchUserLocationWeather:', error);
      setError('Unable to determine location');
      setLoading(false);
    }
  };

  const fetchWeatherByCoordinates = async (lat, lon) => {
    try {
      const weatherData = await InvokeLLM({
        prompt: `Get current weather conditions for coordinates ${lat}, ${lon}. 
                 Include temperature in both Fahrenheit and Celsius, weather description, 
                 humidity percentage, wind speed in mph, and the resolved location name.
                 Return accurate current weather information.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            location: {
              type: "object",
              properties: {
                name: { type: "string" },
                city: { type: "string" },
                region: { type: "string" },
                country: { type: "string" }
              }
            },
            current: {
              type: "object",
              properties: {
                temperature_f: { type: "number" },
                temperature_c: { type: "number" },
                condition: { type: "string" },
                humidity: { type: "number" },
                wind_speed_mph: { type: "number" },
                wind_direction: { type: "string" },
                feels_like_f: { type: "number" }
              }
            }
          }
        }
      });

      if (weatherData && weatherData.current) {
        setWeather(weatherData);
        setCachedWeather(weatherData);
        setError(null);
      } else {
        setError('Weather data not available');
      }
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      handleWeatherError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByIP = async () => {
    try {
      const weatherData = await InvokeLLM({
        prompt: `Get current weather conditions for my current location based on IP address. 
                 Include temperature in both Fahrenheit and Celsius, weather description, 
                 humidity percentage, wind speed in mph, and location name.
                 Return accurate current weather information.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            location: {
              type: "object",
              properties: {
                name: { type: "string" },
                city: { type: "string" },
                region: { type: "string" },
                country: { type: "string" }
              }
            },
            current: {
              type: "object",
              properties: {
                temperature_f: { type: "number" },
                temperature_c: { type: "number" },
                condition: { type: "string" },
                humidity: { type: "number" },
                wind_speed_mph: { type: "number" },
                wind_direction: { type: "string" },
                feels_like_f: { type: "number" }
              }
            }
          }
        }
      });

      if (weatherData && weatherData.current) {
        setWeather(weatherData);
        setCachedWeather(weatherData);
        setError(null);
      } else {
        setError('Weather data not available');
      }
    } catch (error) {
      console.error('Error fetching weather by IP:', error);
      handleWeatherError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeatherError = (error) => {
    if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
      setError('Weather updates temporarily limited. Cached data will be used.');
    } else {
      setError('Unable to fetch weather data');
    }
  };

  const getWeatherIcon = (condition) => {
    if (!condition) return Sun;
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return CloudRain;
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return Cloud;
    }
    return Sun;
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-sky-100/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-600" />
            Current Weather
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => fetchUserLocationWeather(true)}
            disabled={loading}
            className="h-8 w-8 hover:bg-blue-100"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} text-blue-600`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-600">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            Loading weather...
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
            {lastUpdated && weather && (
              <div className="text-xs text-slate-500">
                Last updated: {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </div>
        ) : weather ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(getWeatherIcon(weather.current?.condition), { 
                  className: "w-8 h-8 text-blue-600" 
                })}
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {weather.current?.temperature_f ? `${Math.round(weather.current.temperature_f)}°F` : '--°F'}
                  </div>
                  <div className="text-sm text-slate-600">
                    {weather.current?.condition || 'Unknown'}
                  </div>
                </div>
              </div>
              {weather.current?.feels_like_f && (
                <div className="text-right">
                  <div className="text-xs text-slate-500">Feels like</div>
                  <div className="text-lg font-semibold text-slate-700">
                    {Math.round(weather.current.feels_like_f)}°F
                  </div>
                </div>
              )}
            </div>
            
            {(weather.current?.humidity || weather.current?.wind_speed_mph) && (
              <div className="flex justify-between text-sm text-slate-600 pt-2 border-t border-blue-200">
                {weather.current?.humidity && (
                  <span>Humidity: {weather.current.humidity}%</span>
                )}
                {weather.current?.wind_speed_mph && (
                  <span>Wind: {weather.current.wind_speed_mph} mph</span>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs text-slate-500">
              {weather.location?.city && (
                <span>📍 {weather.location.city}, {weather.location.region}</span>
              )}
              {lastUpdated && (
                <span>Updated {formatLastUpdated(lastUpdated)}</span>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}