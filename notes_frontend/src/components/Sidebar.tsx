import { component$, $, useSignal, useTask$, type PropFunction } from "@builder.io/qwik";
import { listNotes, type Note } from "~/lib/api";

type Props = {
  selectedId: string | null;
  onSelect$: PropFunction<(id: string | null) => void>;
  onCreate$: PropFunction<() => void>;
  refreshKey: number;
};

// PUBLIC_INTERFACE
export const Sidebar = component$<Props>(({ selectedId, onSelect$, onCreate$, refreshKey }) => {
  /** Sidebar with notes list and create button. */
  const notesSig = useSignal<Note[] | null>(null);
  const loading = useSignal<boolean>(false);
  const error = useSignal<string | null>(null);
  const query = useSignal("");

  const fetchNotes$ = $(async () => {
    loading.value = true;
    error.value = null;
    try {
      notesSig.value = await listNotes();
    } catch (e: any) {
      error.value = e?.message ?? "Failed to load notes";
    } finally {
      loading.value = false;
    }
  });

  useTask$(async ({ track }) => {
    track(() => refreshKey);
    await fetchNotes$();
  });

  const filteredNotes = () => {
    const q = query.value.trim().toLowerCase();
    const list = notesSig.value || [];
    if (!q) return list;
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q),
    );
  };

  return (
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">Notes</div>
        <button
          class="btn btn-primary"
          onClick$={onCreate$}
          aria-label="Create Note"
        >
          +
        </button>
      </div>

      <div class="search">
        <input
          type="text"
          placeholder="Search..."
          value={query.value}
          onInput$={(e) => (query.value = (e.target as HTMLInputElement).value)}
          aria-label="Search notes"
        />
      </div>

      {loading.value && <div class="info muted">Loading…</div>}
      {error.value && <div class="info error">{error.value}</div>}
      {!loading.value && !error.value && (
        <ul class="note-list">
          {filteredNotes().map((n) => (
            <li key={n.id}>
              <button
                class={{
                  "note-item": true,
                  active: selectedId === n.id,
                }}
                onClick$={() => onSelect$(n.id)}
                aria-label={`Open note ${n.title}`}
              >
                <div class="title">{n.title || "Untitled"}</div>
                {n.updatedAt && (
                  <div class="meta">
                    {new Date(n.updatedAt).toLocaleString()}
                  </div>
                )}
              </button>
            </li>
          ))}
          {filteredNotes().length === 0 && (
            <li class="info muted small">No notes found</li>
          )}
        </ul>
      )}
    </aside>
  );
});
