import type { HistoryEntry, HistoryState, HistoryTransition } from "./types"

export const HISTORY_LIMIT = 100

const trimHistory = <TSnapshot, TChange>(
  entries: HistoryEntry<TSnapshot, TChange>[],
  limit: number
) => entries.slice(-limit)

interface CommitHistoryOptions<TSnapshot, TChange> extends HistoryState<
  TSnapshot,
  TChange
> {
  present: TSnapshot
  next: TSnapshot
  change: TChange
  equals?: (left: TSnapshot, right: TSnapshot) => boolean
  limit?: number
}

export const commitHistory = <TSnapshot, TChange>({
  present,
  next,
  change,
  past,
  future,
  equals = Object.is,
  limit = HISTORY_LIMIT,
}: CommitHistoryOptions<TSnapshot, TChange>): HistoryTransition<
  TSnapshot,
  TChange
> => {
  if (equals(present, next)) {
    return { present, past, future, appliedChange: null }
  }

  return {
    present: next,
    past: trimHistory([...past, { snapshot: present, change }], limit),
    future: [],
    appliedChange: change,
  }
}

interface MoveHistoryOptions<TSnapshot, TChange> extends HistoryState<
  TSnapshot,
  TChange
> {
  present: TSnapshot
  limit?: number
}

export const undoHistory = <TSnapshot, TChange>({
  present,
  past,
  future,
  limit = HISTORY_LIMIT,
}: MoveHistoryOptions<TSnapshot, TChange>): HistoryTransition<
  TSnapshot,
  TChange
> => {
  const previous = past.at(-1)
  if (!previous) return { present, past, future, appliedChange: null }

  return {
    present: previous.snapshot,
    past: past.slice(0, -1),
    future: trimHistory(
      [...future, { snapshot: present, change: previous.change }],
      limit
    ),
    appliedChange: previous.change,
  }
}

export const redoHistory = <TSnapshot, TChange>({
  present,
  past,
  future,
  limit = HISTORY_LIMIT,
}: MoveHistoryOptions<TSnapshot, TChange>): HistoryTransition<
  TSnapshot,
  TChange
> => {
  const next = future.at(-1)
  if (!next) return { present, past, future, appliedChange: null }

  return {
    present: next.snapshot,
    past: trimHistory(
      [...past, { snapshot: present, change: next.change }],
      limit
    ),
    future: future.slice(0, -1),
    appliedChange: next.change,
  }
}
