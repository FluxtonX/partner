import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, AlertTriangle, Thermometer } from "lucide-react";
import { InvokeLLM } from '@/api/integrations';

const WEATHER_CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function ProjectWeatherWidget({ project, client }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get weather address priority: project site > client address
  const weatherAddress = project.site_address || 
    (client ? `${client.address || ''} ${client.city || ''} ${client.state || ''} ${client.zip_code || ''}`.trim() : '');

  useEffect(() => {
    if (weatherAddress) {
      fetchWeatherData(weatherAddress);
    }
  }, [weatherAddress]);

  const getCachedWeather = (address) => {
    try {
      const cached = localStorage.getItem(`${WEATHER_CACHE_KEY}_${btoa(address)}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Error reading weather cache:', error);
    }
    return null;
  };

  const setCachedWeather = (address, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`${WEATHER_CACHE_KEY}_${btoa(address)}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error writing weather cache:', error);
    }
  };

  const fetchWeatherData = async (address) => {
    // Check cache first
    const cachedWeather = getCachedWeather(address);
    if (cachedWeather) {
      setWeather(cachedWeather);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weatherData = await InvokeLLM({
        prompt: `Get current weather conditions for the location: ${address} 
                 Include temperature in both Fahrenheit and Celsius, weather description, 
                 humidity percentage, wind speed in mph, wind direction, and feels-like temperature. 
                 Also include the resolved location name, city, state/region, and country.
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
                country: { type: "string" },
                full_name: { type: "string" }
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
                feels_like_f: { type: "number" },
                feels_like_c: { type: "number" },
                last_updated: { type: "string" }
              }
            }
          }
        }
      });

      if (weatherData && weatherData.current) {
        setWeather(weatherData);
        setCachedWeather(address, weatherData);
        setError(null);
      } else {
        setError('Weather data not available');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      
      // Handle rate limit errors specifically
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        setError('Weather data temporarily unavailable (rate limit). Will retry in 30 minutes.');
      } else {
        setError('Unable to fetch weather data');
      }
    } finally {
      setLoading(false);
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

  // Don't render if no address available
  if (!weatherAddress) {
    return null;
  }

  return (
    <Card className="border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-slate-700 text-sm">Site Weather</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            Loading weather...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>{error}</span>
          </div>
        ) : weather ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {React.createElement(getWeatherIcon(weather.current?.condition), { 
                  className: "w-5 h-5 text-blue-600" 
                })}
                <div>
                  <div className="font-bold text-slate-900">
                    {weather.current?.temperature_f ? `${Math.round(weather.current.temperature_f)}°F` : '--°F'}
                  </div>
                  <div className="text-xs text-slate-600">
                    {weather.current?.condition || 'Unknown'}
                  </div>
                </div>
              </div>
              {weather.current?.feels_like_f && (
                <div className="text-right">
                  <div className="text-xs text-slate-500">Feels like</div>
                  <div className="text-sm font-semibold text-slate-700">
                    {Math.round(weather.current.feels_like_f)}°F
                  </div>
                </div>
              )}
            </div>
            
            {(weather.current?.humidity || weather.current?.wind_speed_mph) && (
              <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-blue-200">
                {weather.current?.humidity && (
                  <span>Humidity: {weather.current.humidity}%</span>
                )}
                {weather.current?.wind_speed_mph && (
                  <span>Wind: {weather.current.wind_speed_mph} mph {weather.current?.wind_direction || ''}</span>
                )}
              </div>
            )}
            
            {weather.location?.city && (
              <div className="text-xs text-slate-500 pt-1">
                📍 {weather.location.city}, {weather.location.region}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}