import type { DashboardLiveEvent } from "@/lib/types";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

// Pleasant two-note chime generated with the Web Audio API (no asset file needed).
export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [
    { freq: 880, start: 0, dur: 0.12 },
    { freq: 1318.5, start: 0.1, dur: 0.18 },
  ];
  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(0.18, now + note.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.dur);
  }
}

export type DesktopPermission = "default" | "granted" | "denied" | "unsupported";

export function getDesktopPermission(): DesktopPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as DesktopPermission;
}

export async function requestDesktopPermission(): Promise<DesktopPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  try {
    const result = await Notification.requestPermission();
    return result as DesktopPermission;
  } catch {
    return "denied";
  }
}

const TYPE_LABEL: Record<string, string> = {
  lead: "New lead activity",
  invoice: "Invoice update",
  project: "Project update",
  task: "Task update",
  client: "Client update",
};

export function showDesktopNotification(event: DashboardLiveEvent) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (typeof document !== "undefined" && document.visibilityState === "visible") return;
  try {
    const n = new Notification(TYPE_LABEL[event.type] ?? "AgencyFlow", {
      body: event.message,
      tag: event.id,
      icon: "/favicon.ico",
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
    setTimeout(() => n.close(), 8000);
  } catch {
    // ignore
  }
}
