"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactElement, ReactNode } from "react";

type IconName =
  | "room"
  | "laptop"
  | "projector"
  | "lounge"
  | "grid"
  | "check"
  | "calendar"
  | "layers";

type SvgProps = { children: ReactNode; size?: number };
type TiltProps = { children: ReactNode; className?: string; max?: number };

/* ---------- Types ---------- */

type Resource = {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "Available" | "Reserved";
  icon: IconName;
};

type Stat = { label: string; value: string; note: string; icon: IconName };

type ApiReservation = {
  id: string;
  title: string;
  reservedBy: string;
  email?: string | null;
  resourceId: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
  status: string;
  resource: { name: string };
};

type ReservationRow = {
  id: string;
  title: string;
  resource: string;
  resourceId: string;
  person: string;
  email: string;
  time: string;
  status: string;
  startTime: string;
  endTime: string;
  notes: string;
};

/* ---------- Helpers ---------- */

function toLocalDateTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 16);
}

function mapReservation(item: ApiReservation): ReservationRow {
  return {
    id: item.id,
    title: item.title,
    resource: item.resource?.name ?? "",
    resourceId: item.resourceId,
    person: item.reservedBy,
    email: item.email ?? "",
    time: `${new Date(item.startTime).toLocaleString()} - ${new Date(item.endTime).toLocaleString()}`,
    status: item.status,
    startTime: item.startTime,
    endTime: item.endTime,
    notes: item.notes ?? "",
  };
}

function iconForType(typeValue: string): IconName {
  const type = typeValue.toLowerCase();
  if (type.includes("laptop")) return "laptop";
  if (type.includes("projector")) return "projector";
  if (type.includes("equipment")) return "layers";
  if (type.includes("lounge")) return "lounge";
  return "room";
}

/* ---------- Custom SVG pictures ---------- */

const Svg = ({ children, size = 28 }: SvgProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#67e8f9" />
        <stop offset="0.55" stopColor="#a78bfa" />
        <stop offset="1" stopColor="#f472b6" />
      </linearGradient>
    </defs>
    {children}
  </svg>
);

const icons: Record<IconName, (s?: number) => ReactElement> = {
  room: (s) => (
    <Svg size={s}>
      <rect x="6" y="10" width="36" height="28" rx="5" stroke="url(#ico)" strokeWidth="2.5" />
      <path d="M6 18h36" stroke="url(#ico)" strokeWidth="2.5" />
      <circle cx="16" cy="28" r="3" fill="url(#ico)" />
      <circle cx="24" cy="28" r="3" fill="url(#ico)" />
      <circle cx="32" cy="28" r="3" fill="url(#ico)" />
    </Svg>
  ),
  laptop: (s) => (
    <Svg size={s}>
      <rect x="10" y="10" width="28" height="19" rx="3" stroke="url(#ico)" strokeWidth="2.5" />
      <path d="M5 36h38l-3 -4H8z" fill="url(#ico)" />
      <path d="M18 19l4 3-4 3M25 25h5" stroke="url(#ico)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  projector: (s) => (
    <Svg size={s}>
      <rect x="5" y="16" width="30" height="16" rx="5" stroke="url(#ico)" strokeWidth="2.5" />
      <circle cx="26" cy="24" r="5" stroke="url(#ico)" strokeWidth="2.5" />
      <path d="M35 20l8-5v18l-8-5" stroke="url(#ico)" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="12" cy="24" r="1.8" fill="url(#ico)" />
    </Svg>
  ),
  lounge: (s) => (
    <Svg size={s}>
      <rect x="9" y="10" width="30" height="14" rx="6" stroke="url(#ico)" strokeWidth="2.5" />
      <rect x="5" y="22" width="38" height="12" rx="5" stroke="url(#ico)" strokeWidth="2.5" />
      <path d="M12 34v6M36 34v6" stroke="url(#ico)" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  ),
  grid: (s) => (
    <Svg size={s}>
      <rect x="7" y="7" width="14" height="14" rx="4" fill="url(#ico)" />
      <rect x="27" y="7" width="14" height="14" rx="4" stroke="url(#ico)" strokeWidth="2.5" />
      <rect x="7" y="27" width="14" height="14" rx="4" stroke="url(#ico)" strokeWidth="2.5" />
      <rect x="27" y="27" width="14" height="14" rx="4" fill="url(#ico)" />
    </Svg>
  ),
  check: (s) => (
    <Svg size={s}>
      <circle cx="24" cy="24" r="17" stroke="url(#ico)" strokeWidth="2.5" />
      <path d="M16 25l6 6 11-13" stroke="url(#ico)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  calendar: (s) => (
    <Svg size={s}>
      <rect x="6" y="10" width="36" height="32" rx="6" stroke="url(#ico)" strokeWidth="2.5" />
      <path d="M6 20h36M16 5v9M32 5v9" stroke="url(#ico)" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="14" y="26" width="7" height="7" rx="2" fill="url(#ico)" />
    </Svg>
  ),
  layers: (s) => (
    <Svg size={s}>
      <path d="M24 6l18 9-18 9-18-9z" fill="url(#ico)" />
      <path d="M6 24l18 9 18-9M6 33l18 9 18-9" stroke="url(#ico)" strokeWidth="2.5" strokeLinejoin="round" />
    </Svg>
  ),
};

function HeroArt() {
  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" fill="none">
      <defs>
        <linearGradient id="h1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="h2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="h3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0.55" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="150" r="140" fill="url(#glow)" />

      <g className="art-a">
        <path d="M180 40l90 45-90 45-90-45z" fill="url(#h1)" />
        <path d="M90 85v50l90 45v-50z" fill="#4338ca" opacity="0.85" />
        <path d="M270 85v50l-90 45v-50z" fill="#312e81" opacity="0.9" />
      </g>

      <g className="art-b">
        <path d="M80 175l55 28-55 28-55-28z" fill="url(#h2)" />
        <path d="M25 203v30l55 28v-30z" fill="#7e22ce" opacity="0.85" />
        <path d="M135 203v30l-55 28v-30z" fill="#581c87" opacity="0.9" />
      </g>

      <g className="art-c">
        <path d="M285 190l42 21-42 21-42-21z" fill="url(#h3)" />
        <path d="M243 211v24l42 21v-24z" fill="#be185d" opacity="0.85" />
        <path d="M327 211v24l-42 21v-24z" fill="#9d174d" opacity="0.9" />
      </g>

      <circle cx="60" cy="60" r="5" fill="#67e8f9" className="art-b" />
      <circle cx="320" cy="70" r="4" fill="#f472b6" className="art-c" />
      <circle cx="200" cy="270" r="3" fill="#a78bfa" className="art-a" />
    </svg>
  );
}

/* ---------- 3D tilt wrapper ---------- */

function Tilt({ children, className = "", max = 10 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(8px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transformStyle: "preserve-3d", transition: "transform 0.25s ease-out" }}
    >
      {children}
    </div>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationError, setReservationError] = useState("");

  const [reservationTitle, setReservationTitle] = useState("");
  const [reservationResourceId, setReservationResourceId] = useState("");
  const [reservationPerson, setReservationPerson] = useState("");
  const [reservationEmail, setReservationEmail] = useState("");
  const [reservationStart, setReservationStart] = useState("");
  const [reservationEnd, setReservationEnd] = useState("");
  const [reservationNotes, setReservationNotes] = useState("");

  const [savingReservation, setSavingReservation] = useState(false);

  const [activeReservations, setActiveReservations] = useState(0);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [reservationSearch, setReservationSearch] = useState("");
  const [editingReservation, setEditingReservation] = useState<ReservationRow | null>(null);
  const [reservationStatusFilter, setReservationStatusFilter] = useState("ALL");
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  const totalResources = resources.length;
  const resourceTypesCount = new Set(resources.map((resource) => resource.type)).size;
  const availableResources = resources.filter((resource) => resource.status === "Available").length;

  const stats: Stat[] = [
    { label: "Total Resources", value: String(totalResources), note: "Across all categories", icon: "grid" },
    { label: "Available", value: String(availableResources), note: "Ready for reservation", icon: "check" },
    { label: "Active Reservations", value: String(activeReservations), note: "Currently scheduled", icon: "calendar" },
    { label: "Resource Types", value: String(resourceTypesCount), note: "Different categories", icon: "layers" },
  ];

  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceName, setResourceName] = useState("");
  const [resourceType, setResourceType] = useState("Meeting Room");
  const [resourceLocation, setResourceLocation] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [savingResource, setSavingResource] = useState(false);
  const [formError, setFormError] = useState("");

  const [resourceError, setResourceError] = useState("");

  useEffect(() => {
    async function loadResources() {
      try {
        const response = await fetch("/api/resources");

        if (!response.ok) {
          throw new Error("Failed to load resources");
        }

        const data = await response.json();

        const mappedResources: Resource[] = data.map(
          (resource: {
            id: string;
            name: string;
            type: string;
            location: string | null;
            isAvailable: boolean;
          }) => ({
            id: resource.id,
            name: resource.name,
            type: resource.type,
            location: resource.location ?? "Not specified",
            status: resource.isAvailable ? "Available" : "Reserved",
            icon: iconForType(resource.type),
          })
        );

        setResources(mappedResources);
      } catch (error) {
        console.error(error);
        setResourceError("Unable to load resources. Please refresh.");
      } finally {
        setLoadingResources(false);
      }
    }

    loadResources();
  }, []);

  useEffect(() => {
    async function loadReservations() {
      try {
        const response = await fetch("/api/reservations");

        if (!response.ok) {
          throw new Error("Failed to fetch reservations");
        }

        const data: ApiReservation[] = await response.json();

        setReservations(data.map(mapReservation));
        setActiveReservations(data.filter((item) => item.status === "CONFIRMED").length);
      } catch (error) {
        console.error("Failed to load reservations:", error);
      } finally {
        setLoadingReservations(false);
      }
    }

    loadReservations();
  }, []);

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch = `${r.title} ${r.resource} ${r.person} ${r.status}`
      .toLowerCase()
      .includes(reservationSearch.toLowerCase());
    const matchesStatus =
      reservationStatusFilter === "ALL" || r.status === reservationStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="aurora relative min-h-screen overflow-hidden text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .serif { font-family: 'Playfair Display', Georgia, serif; }
        main { font-family: 'Inter', system-ui, sans-serif; }

        .aurora {
          background: linear-gradient(125deg, #05010f, #0b1140, #2a0f5c, #4a0e4e, #07263d, #05010f);
          background-size: 500% 500%;
          animation: flow 26s ease-in-out infinite;
        }
        @keyframes flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .orb { position: absolute; border-radius: 9999px; filter: blur(100px); pointer-events: none; opacity: .4; }
        .orb-1 { width: 440px; height: 440px; background: #22d3ee; top: -140px; right: -100px; animation: d1 18s ease-in-out infinite; }
        .orb-2 { width: 400px; height: 400px; background: #c026d3; bottom: -150px; left: 15%; animation: d2 22s ease-in-out infinite; }
        .orb-3 { width: 320px; height: 320px; background: #6366f1; top: 45%; left: -110px; opacity: .3; animation: d1 26s ease-in-out infinite reverse; }
        @keyframes d1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px,60px) scale(1.15); } }
        @keyframes d2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(90px,-60px) scale(1.1); } }

        .glass {
          background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.03));
          border: 1px solid rgba(167,139,250,.28);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 22px 44px -18px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.14);
        }

        .grad-text {
          background: linear-gradient(90deg, #67e8f9, #a78bfa, #f472b6, #67e8f9);
          background-size: 250% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: shine 7s linear infinite;
        }
        @keyframes shine { to { background-position: 250% center; } }

        .btn-neon {
          background: linear-gradient(135deg, #22d3ee, #8b5cf6, #ec4899);
          color: #fff;
          box-shadow: 0 12px 26px -8px rgba(139,92,246,.7), 0 4px 0 #4c1d95;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .btn-neon:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -8px rgba(139,92,246,.8), 0 6px 0 #4c1d95; }
        .btn-neon:active { transform: translateY(3px); box-shadow: 0 4px 10px -4px rgba(139,92,246,.6), 0 1px 0 #4c1d95; }

        .icon-tile {
          background: linear-gradient(135deg, rgba(103,232,249,.18), rgba(167,139,250,.22), rgba(244,114,182,.18));
          border: 1px solid rgba(255,255,255,.18);
          box-shadow: 0 6px 0 rgba(30,27,75,.9), inset 0 1px 0 rgba(255,255,255,.25);
        }

        .art-a { animation: fa 6s ease-in-out infinite; }
        .art-b { animation: fb 7s ease-in-out infinite; }
        .art-c { animation: fa 8s ease-in-out infinite reverse; }
        @keyframes fa { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes fb { 0%,100% { transform: translateY(0); } 50% { transform: translateY(10px); } }

        .pop { transform: translateZ(28px); }
        .pop-sm { transform: translateZ(16px); }

        .row-3d { transition: background .2s ease; }
        .row-3d:hover { background: rgba(167,139,250,.12); }

        .scroll-soft::-webkit-scrollbar { height: 8px; }
        .scroll-soft::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 8px; }
      `}</style>

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="glass hidden w-64 shrink-0 border-y-0 border-l-0 p-6 md:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="icon-tile flex h-11 w-11 items-center justify-center rounded-xl">
              {icons.layers(26)}
            </div>
            <div>
              <h1 className="serif grad-text text-lg font-bold">PrimeWave</h1>
              <p className="text-xs text-cyan-200/80">Resource Management</p>
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/70">Workspace</p>

          <nav className="space-y-2">
            <a href="#dashboard" className="flex items-center gap-3 rounded-xl border border-violet-400/40 bg-violet-500/20 px-4 py-3 font-semibold text-white">
              {icons.grid(20)} Dashboard
            </a>
            <a href="#resources" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:translate-x-1 hover:bg-white/5">
              {icons.laptop(20)} Resources
            </a>
            <a href="#reservations" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:translate-x-1 hover:bg-white/5">
              {icons.calendar(20)} Reservations
            </a>
          </nav>

          <Tilt className="mt-12" max={12}>
            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed,#db2777)", boxShadow: "0 18px 32px -12px rgba(0,0,0,.8)" }}
            >
              <p className="pop-sm text-sm font-bold">Need assistance?</p>
              <p className="pop-sm mt-2 text-xs leading-5 text-white/85">Manage your workspace and keep your resources organized.</p>
              <p className="pop-sm mt-4 text-xs font-bold">PrimeWave Lab</p>
            </div>
          </Tilt>

          <div className="mt-8 border-t border-violet-300/20 pt-5">
            <p className="text-xs text-violet-300/60">Resource Reservation System</p>
            <p className="mt-1 text-xs text-violet-300/60">Version 1.0</p>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1" id="dashboard">
          <header className="glass flex flex-wrap items-center justify-between gap-4 border-x-0 border-t-0 px-5 py-5 sm:px-8">
            <div>
              <p className="text-sm text-cyan-200/80">PrimeWave Lab / Workspace</p>
              <h2 className="serif mt-1 text-xl font-bold sm:text-2xl">Resource Dashboard</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">Lab Administrator</p>
                <p className="text-xs text-violet-300/70">Workspace manager</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                style={{ background: "linear-gradient(135deg,#22d3ee,#8b5cf6,#ec4899)", boxShadow: "0 4px 0 #3b0764" }}
              >
                PA
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-10 p-5 sm:p-8">
            {/* Hero */}
            <div className="glass flex flex-wrap items-center justify-between gap-8 rounded-3xl p-6 sm:p-10">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Premium Workspace</p>
                <h3 className="serif mt-3 text-3xl font-bold sm:text-4xl">
                  <span className="mr-2">Welcome back,</span>
                  <span className="grad-text">Administrator</span>
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Here&apos;s an elegant overview of your workspace resources and upcoming reservations.
                </p>
                <a href="#reservations" className="btn-neon mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold">
                  + View Reservations
                </a>
              </div>

              <div className="mx-auto h-64 w-80 sm:mx-0 sm:mr-6">
                <Tilt max={8} className="h-full w-full">
                  <HeroArt />
                </Tilt>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((s) => (
                <Tilt key={s.label}>
                  <div className="glass rounded-2xl p-5">
                    <div className="pop-sm flex items-center justify-between">
                      <p className="text-sm text-slate-300">{s.label}</p>
                      <span className="icon-tile flex h-11 w-11 items-center justify-center rounded-xl">
                        {icons[s.icon](24)}
                      </span>
                    </div>
                    <p className="pop serif grad-text mt-4 text-4xl font-bold">{s.value}</p>
                    <p className="pop-sm mt-2 text-xs text-violet-300/70">{s.note}</p>
                  </div>
                </Tilt>
              ))}
            </div>

            {/* Add Resource Form */}
            {showResourceForm && (
              <div className="glass rounded-2xl p-6">
                <h3 className="serif mb-5 text-xl font-bold">Add New Resource</h3>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setFormError("");
                    setSavingResource(true);

                    try {
                      const response = await fetch("/api/resources", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: resourceName,
                          type: resourceType,
                          location: resourceLocation,
                          description: resourceDescription,
                        }),
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(data.error || "Failed to save resource");
                      }

                      setResources((previous) => [
                        ...previous,
                        {
                          id: data.id,
                          name: data.name,
                          type: data.type,
                          location: data.location ?? "Not specified",
                          status: data.isAvailable ? "Available" : "Reserved",
                          icon: iconForType(data.type),
                        },
                      ]);

                      setResourceName("");
                      setResourceType("Meeting Room");
                      setResourceLocation("");
                      setResourceDescription("");
                      setShowResourceForm(false);
                    } catch (error) {
                      setFormError(
                        error instanceof Error ? error.message : "Something went wrong"
                      );
                    } finally {
                      setSavingResource(false);
                    }
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Resource Name</label>
                    <input
                      type="text"
                      value={resourceName}
                      onChange={(e) => setResourceName(e.target.value)}
                      placeholder="e.g. Conference Room B"
                      required
                      className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Resource Type</label>
                    <select
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    >
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Projector">Projector</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Lounge">Lounge</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm text-slate-300">Location</label>
                    <input
                      type="text"
                      value={resourceLocation}
                      onChange={(e) => setResourceLocation(e.target.value)}
                      placeholder="e.g. Floor 2"
                      required
                      className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm text-slate-300">Description</label>
                    <textarea
                      value={resourceDescription}
                      onChange={(e) => setResourceDescription(e.target.value)}
                      placeholder="Describe the resource"
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  {formError && (
                    <p className="text-sm text-red-400 sm:col-span-2">{formError}</p>
                  )}

                  <div className="flex gap-3 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={savingResource}
                      className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {savingResource ? "Saving..." : "Save Resource"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowResourceForm(false)}
                      className="rounded-lg border border-white/15 px-5 py-3 text-slate-300 transition hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Create Reservation Form */}
            {showReservationForm && (
              <div className="glass rounded-2xl p-6">
                <h3 className="serif mb-5 text-xl font-bold">Create Reservation</h3>

                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setReservationError("");
                    setSavingReservation(true);

                    try {
                      const response = await fetch("/api/reservations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: reservationTitle,
                          resourceId: reservationResourceId,
                          reservedBy: reservationPerson,
                          email: reservationEmail,
                          startTime: reservationStart,
                          endTime: reservationEnd,
                          notes: reservationNotes,
                        }),
                      });

                      const created = await response.json();

                      if (!response.ok) {
                        throw new Error(created.error || "Unable to create reservation.");
                      }

                      const reservationsResponse = await fetch("/api/reservations");

                      if (reservationsResponse.ok) {
                        const data: ApiReservation[] = await reservationsResponse.json();

                        setReservations(data.map(mapReservation));
                        setActiveReservations(
                          data.filter((item) => item.status === "CONFIRMED").length
                        );
                      }

                      setReservationTitle("");
                      setReservationResourceId("");
                      setReservationPerson("");
                      setReservationEmail("");
                      setReservationStart("");
                      setReservationEnd("");
                      setReservationNotes("");
                      setShowReservationForm(false);
                    } catch (error) {
                      setReservationError(
                        error instanceof Error
                          ? error.message
                          : "Unable to create reservation."
                      );
                    } finally {
                      setSavingReservation(false);
                    }
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <input
                    required
                    value={reservationTitle}
                    onChange={(event) => setReservationTitle(event.target.value)}
                    placeholder="Reservation title"
                    className="rounded-lg border border-violet-300/20 bg-slate-950/50 p-3 text-white"
                  />

                  <select
                    required
                    value={reservationResourceId}
                    onChange={(event) => setReservationResourceId(event.target.value)}
                    className="rounded-lg border border-violet-300/20 bg-slate-950/50 p-3 text-white"
                  >
                    <option value="">Select a resource</option>
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id} className="bg-slate-900">
                        {resource.name}
                      </option>
                    ))}
                  </select>

                  <input
                    required
                    value={reservationPerson}
                    onChange={(event) => setReservationPerson(event.target.value)}
                    placeholder="Your name"
                    className="rounded-lg border border-violet-300/20 bg-slate-950/50 p-3 text-white"
                  />

                  <input
                    required
                    type="email"
                    value={reservationEmail}
                    onChange={(event) => setReservationEmail(event.target.value)}
                    placeholder="Email address"
                    className="rounded-lg border border-violet-300/20 bg-slate-950/50 p-3 text-white"
                  />

                  <label className="text-sm text-slate-300">
                    Start time
                    <input
                      required
                      type="datetime-local"
                      value={reservationStart}
                      onChange={(event) => setReservationStart(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-violet-300/20 bg-slate-950/50 p-3 text-white"
                    />
                  </label>

                  <label className="text-sm text-slate-300">
                    End time
                    <input
                      required
                      type="datetime-local"
                      value={reservationEnd}
                      onChange={(event) => setReservationEnd(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-violet-300/20 bg-slate-950/50 p-3 text-white"
                    />
                  </label>

                  <textarea
                    value={reservationNotes}
                    onChange={(event) => setReservationNotes(event.target.value)}
                    placeholder="Notes (optional)"
                    className="rounded-lg border border-violet-300/20 bg-slate-950/50 p-3 text-white sm:col-span-2"
                  />

                  {reservationError && (
                    <p className="text-sm text-red-300 sm:col-span-2">{reservationError}</p>
                  )}

                  <div className="flex gap-3 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={savingReservation}
                      className="rounded-lg bg-purple-500 px-5 py-3 font-semibold text-white hover:bg-purple-400 disabled:opacity-50"
                    >
                      {savingReservation ? "Saving..." : "Save Reservation"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReservationForm(false)}
                      className="rounded-lg border border-violet-300/30 px-5 py-3 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Resources */}
            <div id="resources" className="scroll-mt-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="serif text-xl font-bold">Workspace Resources</h3>
                  <p className="mt-1 text-sm text-cyan-200/80">A quick look at registered resources.</p>
                  {resourceError && (
                    <p className="mt-2 text-sm text-red-300">{resourceError}</p>
                  )}
                  {loadingResources && (
                    <p className="mt-2 text-sm text-slate-400">Loading resources...</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResourceForm(!showResourceForm);
                      setFormError("");
                    }}
                    className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
                  >
                    + Add Resource
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowReservationForm(!showReservationForm);
                      setReservationError("");
                    }}
                    className="rounded-lg border border-purple-400/40 bg-purple-400/10 px-4 py-2 text-sm font-medium text-purple-200 transition hover:bg-purple-400/20"
                  >
                    + Create Reservation
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {resources.map((r) => (
                  <Tilt key={r.id} max={6} className="h-full">
                    <article className="glass flex h-full flex-col rounded-2xl p-5">
                      <div className="flex items-start justify-between">
                        <div className="icon-tile flex h-14 w-14 items-center justify-center rounded-xl">
                          {icons[r.icon](30)}
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            r.status === "Available"
                              ? "border-emerald-300/40 bg-emerald-400/20 text-emerald-200"
                              : "border-pink-300/40 bg-pink-400/20 text-pink-200"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <h4 className="serif mt-5 text-lg font-bold">{r.name}</h4>
                      <p className="mt-1 text-sm text-cyan-200/80">{r.type}</p>

                      <p className="mt-4 border-t border-violet-300/20 pt-3 text-xs text-violet-300/70">
                        Location: {r.location}
                      </p>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${r.name}?`)) return;

                         const res = await fetch(
                             `/api/resources?id=${encodeURIComponent(r.id)}`,
                                  {
                                    method: "DELETE",
                                  }
                              );

                          if (res.ok) {
                            setResources((previous) =>
                              previous.filter((item) => item.id !== r.id)
                            );
                          } else {
                            const data = await res.json().catch(() => null);
                            alert(data?.error || "Unable to delete resource.");
                          }
                        }}
                        className="mt-4 w-full rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                      >
                        Delete Resource
                      </button>
                    </article>
                  </Tilt>
                ))}
              </div>
            </div>

            {/* Reservations */}
            <div id="reservations" className="scroll-mt-6">
              <div className="mb-6">
                <h3 className="serif text-xl font-bold">Upcoming Reservations</h3>
                <p className="mt-1 text-sm text-cyan-200/80">Review scheduled workspace bookings.</p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Search by reservation, resource, or person..."
                    value={reservationSearch}
                    onChange={(e) => setReservationSearch(e.target.value)}
                    className="w-full rounded-xl border border-violet-300/20 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 sm:max-w-md"
                  />

                  <select
                    value={reservationStatusFilter}
                    onChange={(e) => setReservationStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-violet-300/20 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:max-w-xs"
                  >
                    <option value="ALL">All Reservations</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="glass scroll-soft overflow-x-auto rounded-2xl">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-violet-500/15 text-xs uppercase tracking-[0.15em] text-cyan-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Reservation</th>
                      <th className="px-6 py-4 font-semibold">Resource</th>
                      <th className="px-6 py-4 font-semibold">Reserved By</th>
                      <th className="px-6 py-4 font-semibold">Time</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-300/15">
                    {loadingReservations && (
                      <tr>
                        <td colSpan={6} className="px-6 py-6 text-center text-slate-400">
                          Loading reservations...
                        </td>
                      </tr>
                    )}

                    {filteredReservations.map((r) => (
                      <tr key={r.id} className="row-3d">
                        <td className="px-6 py-4 font-semibold text-white">{r.title}</td>
                        <td className="px-6 py-4 text-slate-300">{r.resource}</td>
                        <td className="px-6 py-4 text-slate-300">{r.person}</td>
                        <td className="px-6 py-4 text-slate-300">{r.time}</td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              r.status === "CANCELLED"
                                ? "border-red-300/40 bg-red-400/20 text-red-200"
                                : "border-emerald-300/40 bg-emerald-400/20 text-emerald-200"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {r.status === "CONFIRMED" && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingReservation(r)}
                                className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-200 hover:bg-red-500/30"
                                onClick={async () => {
                                  if (!window.confirm("Cancel this reservation?")) return;

                                  const res = await fetch(`/api/reservations/${r.id}`, {
                                    method: "PATCH",
                                  });

                                  if (res.ok) {
                                    window.location.reload();
                                  } else {
                                    alert("Unable to cancel reservation.");
                                  }
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Reservation */}
            {editingReservation && (
              <div className="glass rounded-2xl p-6">
                <h3 className="serif text-xl font-bold">Edit Reservation</h3>

                <p className="mt-1 text-sm text-cyan-200/80">
                  Editing: {editingReservation.title}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-cyan-200">Reservation Title</label>
                    <input
                      type="text"
                      required
                      value={editingReservation.title ?? ""}
                      onChange={(e) =>
                        setEditingReservation({ ...editingReservation, title: e.target.value })
                      }
                      className="w-full rounded-xl border border-violet-300/20 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-cyan-200">Reserved By</label>
                    <input
                      type="text"
                      required
                      value={editingReservation.person ?? ""}
                      onChange={(e) =>
                        setEditingReservation({ ...editingReservation, person: e.target.value })
                      }
                      className="w-full rounded-xl border border-violet-300/20 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-cyan-200">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editingReservation.email ?? ""}
                      onChange={(e) =>
                        setEditingReservation({ ...editingReservation, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-violet-300/20 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-cyan-200">Resource</label>
                    <select
                      required
                      value={editingReservation.resourceId ?? ""}
                      onChange={(e) =>
                        setEditingReservation({
                          ...editingReservation,
                          resourceId: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-violet-300/20 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300"
                    >
                      <option value="" disabled>
                        Select a resource
                      </option>
                      {resources.map((resource) => (
                        <option key={resource.id} value={resource.id} className="bg-slate-900">
                          {resource.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-cyan-200">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={
                        editingReservation.startTime
                          ? toLocalDateTimeInput(editingReservation.startTime)
                          : ""
                      }
                      onChange={(e) =>
                        setEditingReservation({
                          ...editingReservation,
                          startTime: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        })
                      }
                      className="w-full rounded-xl border border-violet-300/20 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-cyan-200">End Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={
                        editingReservation.endTime
                          ? toLocalDateTimeInput(editingReservation.endTime)
                          : ""
                      }
                      onChange={(e) =>
                        setEditingReservation({
                          ...editingReservation,
                          endTime: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        })
                      }
                      className="w-full rounded-xl border border-violet-300/20 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm text-cyan-200">Notes (Optional)</label>
                    <textarea
                      rows={3}
                      value={editingReservation.notes ?? ""}
                      onChange={(e) =>
                        setEditingReservation({ ...editingReservation, notes: e.target.value })
                      }
                      placeholder="Add any additional details..."
                      className="w-full rounded-xl border border-violet-300/20 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-300"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        !editingReservation.title?.trim() ||
                        !editingReservation.person?.trim() ||
                        !editingReservation.email?.trim() ||
                        !editingReservation.resourceId ||
                        !editingReservation.startTime ||
                        !editingReservation.endTime
                      ) {
                        alert("Please complete all required fields.");
                        return;
                      }

                      if (
                        new Date(editingReservation.endTime).getTime() <=
                        new Date(editingReservation.startTime).getTime()
                      ) {
                        alert("End time must be later than start time.");
                        return;
                      }

                      try {
                        const res = await fetch(
                          `/api/reservations/${editingReservation.id}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: editingReservation.title.trim(),
                              reservedBy: editingReservation.person.trim(),
                              email: editingReservation.email.trim(),
                              resourceId: editingReservation.resourceId,
                              startTime: editingReservation.startTime,
                              endTime: editingReservation.endTime,
                              notes: editingReservation.notes ?? "",
                            }),
                          }
                        );

                        const data = await res.json();

                        if (!res.ok) {
                          alert(data.error || "Unable to update reservation.");
                          return;
                        }

                        alert("Reservation updated successfully!");
                        window.location.reload();
                      } catch (error) {
                        alert("Something went wrong. Please try again.");
                        console.error(error);
                      }
                    }}
                    className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingReservation(null)}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <footer className="border-t border-violet-300/20 py-5 text-center text-xs text-violet-300/60">
              PrimeWave Lab Resource Reservation Management System
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}