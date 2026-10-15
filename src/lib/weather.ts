// Helpers for the Open-Meteo API
// No API key needed, so we call it directly

export type CurrentWeather = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
};

export type DayForecast = {
  date: string;
  max: number;
  min: number;
  code: number;
};

export type WeatherData = {
  current: CurrentWeather;
  daily: DayForecast[];
};

export type CityResult = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

// WMO weather code -> human-readable label
export function describe(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Cloudy";
}

// Small icon per weather code
export function iconFor(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code === 1 || code === 2) return isDay ? "⛅" : "☁️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "☁️";
}

// Sky gradient based on conditions and time of day
// Used for the full-page background
export function skyFor(code: number, isDay: boolean): string {
  if (!isDay) return "from-[#0a0f24] via-[#182154] to-[#2e3d75]"; // night
  if (code === 0 || code === 1) return "from-[#2f7fc4] via-[#5aa9e6] to-[#a5d8f7]"; // bright sun
  if (code === 2) return "from-[#3d84b8] via-[#74aede] to-[#c3ddf0]"; // light clouds
  if (code === 3 || code === 45 || code === 48)
    return "from-[#55677e] via-[#7d8fa3] to-[#aeb9c6]"; // overcast / fog
  if (code >= 51 && code <= 82) return "from-[#37475e] via-[#4e6076] to-[#75859a]"; // rain
  if (code >= 95) return "from-[#232838] via-[#39415c] to-[#59637e]"; // storm
  return "from-[#3d84b8] via-[#74aede] to-[#c3ddf0]";
}

// "Mon", "Tue" from a date string
export function weekday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

const BASE = "https://api.open-meteo.com/v1/forecast";

// Fetch weather by latitude/longitude
export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `${BASE}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,pressure_msl` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=6`;

  // Fresh data every 10 min (ISR)
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error("Weather ante problem hoise");

  const j = await res.json();
  const c = j.current;
  const daily: DayForecast[] = j.daily.time.map((t: string, i: number) => ({
    date: t,
    max: Math.round(j.daily.temperature_2m_max[i]),
    min: Math.round(j.daily.temperature_2m_min[i]),
    code: j.daily.weather_code[i],
  }));

  return {
    current: {
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      windSpeed: Math.round(c.wind_speed_10m),
      pressure: Math.round(c.pressure_msl),
      weatherCode: c.weather_code,
      isDay: c.is_day === 1,
      time: c.time,
    },
    daily,
  };
}

// Find a city by name (for search)
export async function searchCity(q: string): Promise<CityResult[]> {
  if (q.trim().length < 2) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`
  );
  if (!res.ok) return [];
  const j = await res.json();
  if (!j.results) return [];
  return j.results.map((r: any) => ({
    name: r.name,
    country: r.country ?? "",
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
