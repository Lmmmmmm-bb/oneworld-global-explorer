export interface HistoryEntry<TSnapshot, TChange> {
  snapshot: TSnapshot
  change: TChange
}

export interface HistoryState<TSnapshot, TChange> {
  past: HistoryEntry<TSnapshot, TChange>[]
  future: HistoryEntry<TSnapshot, TChange>[]
}

export interface HistoryTransition<TSnapshot, TChange> extends HistoryState<
  TSnapshot,
  TChange
> {
  present: TSnapshot
  appliedChange: TChange | null
}
