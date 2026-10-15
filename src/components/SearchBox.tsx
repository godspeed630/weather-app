"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchCity, type CityResult } from "../lib/weather";

// City search box — suggestions appear as you type
export default function SearchBox() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  // Search 400ms after typing stops (not on every keystroke)
  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      const r = await searchCity(q);
      setHits(r);
      setOpen(true);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  // Close dropdown on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Show weather for the selected city
  const pick = (c: CityResult) => {
    setOpen(false);
    setQ("");
    router.push(`/?lat=${c.latitude}&lon=${c.longitude}&name=${encodeURIComponent(c.name)}`);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-sm">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length > 0 && setOpen(true)}
        placeholder="Search city… (e.g. Dhaka)"
        className="w-full rounded-full bg-white/20 px-5 py-2.5 text-sm text-white placeholder-white/60 outline-none backdrop-blur-md transition focus:bg-white/30 focus:ring-2 focus:ring-white/40"
      />
      {open && hits.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-md">
          {hits.map((c, i) => (
            <li key={`${c.latitude}-${c.longitude}-${i}`}>
              <button
                onClick={() => pick(c)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-800 transition hover:bg-sky-50"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-slate-500">{c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
