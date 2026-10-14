import type { Metadata } from "next";
import SearchBox from "../components/SearchBox";
import { getWeather, describe, iconFor, skyFor, weekday } from "../lib/weather";

export const metadata: Metadata = {
  title: "Weather — Ajker Akash",
  description: "Live weather for any city, powered by Open-Meteo",
};

// default shohor: Dhaka
const DHAKA = { lat: 23.8103, lon: 90.4125, name: "Dhaka" };

type Props = {
  searchParams: Promise<{ lat?: string; lon?: string; name?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const lat = sp.lat ? Number(sp.lat) : DHAKA.lat;
  const lon = sp.lon ? Number(sp.lon) : DHAKA.lon;
  const cityName = sp.name ?? DHAKA.name;

  // server thekei weather ana — page load e ready thake
  const w = await getWeather(lat, lon);
  const c = w.current;
  const sky = skyFor(c.weatherCode, c.isDay);

  // ajker ta bad diye porer 5 din
  const coming = w.daily.slice(1, 6);

  return (
    <main
      className={`min-h-screen bg-gradient-to-b ${sky} px-4 pb-10 pt-6 text-white transition-colors duration-700 sm:px-8`}
    >
      <div className="mx-auto max-w-3xl">
        {/* upor: search */}
        <div className="flex justify-center sm:justify-end">
          <SearchBox />
        </div>

        {/* hero: boro temperature */}
        <section className="mt-10 text-center sm:mt-14">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
            {cityName}
          </p>
          <div className="mt-2 text-8xl font-extralight tabular-nums sm:text-9xl">
            {c.temperature}°
          </div>
          <p className="mt-2 text-xl font-light">
            {iconFor(c.weatherCode, c.isDay)} {describe(c.weatherCode)}
          </p>
          <p className="mt-1 text-sm text-white/70">
            Feels like {c.feelsLike}° · H {w.daily[0].max}° / L {w.daily[0].min}°
          </p>
        </section>

        {/* chhoto detail card gula */}
        <section className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Detail label="Humidity" value={`${c.humidity}%`} />
          <Detail label="Wind" value={`${c.windSpeed} km/h`} />
          <Detail label="Pressure" value={`${c.pressure} hPa`} />
          <Detail
            label="Condition"
            value={c.isDay ? "Daytime" : "Night"}
          />
        </section>

        {/* 5 diner forecast */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
            Next 5 days
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {coming.map((d) => (
              <div
                key={d.date}
                className="rounded-2xl bg-white/15 px-2 py-3 text-center backdrop-blur-md"
              >
                <p className="text-xs text-white/70">{weekday(d.date)}</p>
                <p className="my-1 text-2xl">{iconFor(d.code, true)}</p>
                <p className="text-sm font-semibold">{d.max}°</p>
                <p className="text-xs text-white/60">{d.min}°</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-white/50">
          Data: Open-Meteo · No API key needed
        </footer>
      </div>
    </main>
  );
}

// ekta chhoto info card
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-0.5 text-lg font-medium">{value}</p>
    </div>
  );
}
