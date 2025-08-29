import { component$, useSignal, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Sidebar } from "~/components/Sidebar";
import { Editor } from "~/components/Editor";
import "./app.css";

// PUBLIC_INTERFACE
export default component$(() => {
  /** Main route: sidebar + editor with CRUD operations. */
  const selectedId = useSignal<string | null>(null);
  const refreshKey = useSignal(0);

  return (
    <div class="app">
      <Sidebar
        selectedId={selectedId.value}
        onSelect$={$((id) => (selectedId.value = id))}
        onCreate$={$(() => (selectedId.value = null))}
        refreshKey={refreshKey.value}
      />
      <Editor
        selectedId={selectedId.value}
        onChanged$={$((kind) => {
          // After any change, trigger sidebar reload
          refreshKey.value++;
          if (kind === "deleted") {
            selectedId.value = null;
          }
        })}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Simple Notes App",
  meta: [
    {
      name: "description",
      content:
        "A minimalistic notes application built with Qwik. Create, edit, delete, and list notes.",
    },
    {
      name: "theme-color",
      content: "#ffffff",
    },
  ],
};
