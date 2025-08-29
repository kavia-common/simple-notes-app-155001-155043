import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";
import { createNote, deleteNote, getNote, updateNote, type Note } from "~/lib/api";

type Props = {
  selectedId: string | null;
  onChanged$: PropFunction<(kind: "created" | "updated" | "deleted", note?: Note) => void>;
};

// PUBLIC_INTERFACE
export const Editor = component$<Props>(({ selectedId, onChanged$ }) => {
  /** Main panel editor to view/create/update/delete notes. */
  const mode = useSignal<"idle" | "view" | "create">("idle");
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

  const id = useSignal<string | null>(selectedId);
  const title = useSignal("");
  const content = useSignal("");

  useTask$(({ track }) => {
    const sel = track(() => selectedId);
    id.value = sel;
    if (sel === null) {
      // create mode
      mode.value = "create";
      title.value = "";
      content.value = "";
      error.value = null;
    } else {
      // load note
      mode.value = "view";
      void loadNote$(sel);
    }
  });

  const loadNote$ = $(async (noteId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const n = await getNote(noteId);
      title.value = n.title || "";
      content.value = n.content || "";
    } catch (e: any) {
      error.value = e?.message ?? "Failed to load note";
    } finally {
      loading.value = false;
    }
  });

  const save$ = $(async () => {
    loading.value = true;
    error.value = null;
    try {
      if (mode.value === "create") {
        const created = await createNote({ title: title.value.trim(), content: content.value });
        id.value = created.id;
        mode.value = "view";
        await onChanged$("created", created);
      } else if (mode.value === "view" && id.value) {
        const updated = await updateNote(id.value, { title: title.value.trim(), content: content.value });
        await onChanged$("updated", updated);
      }
    } catch (e: any) {
      error.value = e?.message ?? "Failed to save note";
    } finally {
      loading.value = false;
    }
  });

  const remove$ = $(async () => {
    if (!id.value) return;
    const confirmMsg = "Delete this note? This action cannot be undone.";
    if (!window.confirm(confirmMsg)) return;
    loading.value = true;
    error.value = null;
    try {
      await deleteNote(id.value);
      id.value = null;
      title.value = "";
      content.value = "";
      mode.value = "create";
      await onChanged$("deleted");
    } catch (e: any) {
      error.value = e?.message ?? "Failed to delete note";
    } finally {
      loading.value = false;
    }
  });

  return (
    <section class="editor">
      <div class="toolbar">
        <div class="left">
          <span class="badge">{mode.value === "create" ? "New Note" : "Editing"}</span>
        </div>
        <div class="right">
          {mode.value === "view" && id.value && (
            <button class="btn btn-danger ghost" disabled={loading.value} onClick$={remove$}>
              Delete
            </button>
          )}
          <button class="btn btn-accent" disabled={loading.value} onClick$={save$}>
            {mode.value === "create" ? "Create" : "Save"}
          </button>
        </div>
      </div>

      {error.value && <div class="alert error">{error.value}</div>}

      <div class="fields">
        <input
          class="input title"
          placeholder="Title"
          value={title.value}
          onInput$={(e) => (title.value = (e.target as HTMLInputElement).value)}
          aria-label="Note title"
        />
        <textarea
          class="input content"
          placeholder="Start typing..."
          value={content.value}
          onInput$={(e) => (content.value = (e.target as HTMLTextAreaElement).value)}
          aria-label="Note content"
        />
      </div>

      {loading.value && <div class="overlay">Working…</div>}
    </section>
  );
});
