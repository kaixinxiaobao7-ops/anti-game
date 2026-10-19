export interface SaveData {
  wins: number;
  sound: boolean;
}

const STORAGE_KEY = "antigame.store";

export function loadStore(): SaveData {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (typeof raw !== "object" || raw === null) return { wins: 0, sound: true };
    const candidate = raw as { wins?: unknown; sound?: unknown };
    return {
      wins: typeof candidate.wins === "number" && Number.isFinite(candidate.wins)
        ? Math.max(0, Math.floor(candidate.wins))
        : 0,
      sound: candidate.sound !== false,
    };
  } catch {
    return { wins: 0, sound: true };
  }
}

export function saveStore(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // The machine also refuses to remember you.
  }
}
