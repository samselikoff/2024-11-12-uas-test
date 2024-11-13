"use client";

import { createTodo, updateTodo } from "@/app/actions";
import Spinner from "@/app/spinner";
import { useActionState, useOptimistic } from "react";

export default function Todos({
  todos,
}: {
  todos: { id: string; text: string }[];
}) {
  const [draftTodos, action, isPending] = useActionState(
    async (
      clientTodos: { id?: string; text: string; clientId: string }[],
      {
        type,
        payload,
      }:
        | { type: "create"; payload: { clientId: string } }
        | {
            type: "update";
            payload: { clientId: string; text: string };
          },
    ) => {
      switch (type) {
        case "create":
          const newTodo = await createTodo();
          return [...clientTodos, { clientId: payload.clientId, ...newTodo }];

        case "update":
          const id = clientTodos.find(
            (t) => t.clientId === payload.clientId,
          )?.id;
          if (!id) return clientTodos;

          const updatedTodo = await updateTodo({
            id,
            text: payload.text,
          });
          return clientTodos.map((t) =>
            t.id === updatedTodo.id ? { ...t, ...updatedTodo } : t,
          );

        default:
          return clientTodos;
      }
    },
    todos.map((t) => ({ ...t, clientId: t.id })),
  );
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(draftTodos);

  return (
    <div className="m-8">
      <div className="flex items-center gap-4">
        <h1>Todos</h1>

        <Spinner loading={isPending} />
      </div>

      <form
        action={async () => {
          const clientId = window.crypto.randomUUID();
          setOptimisticTodos((todos) => [...todos, { clientId, text: "" }]);
          await action({ type: "create", payload: { clientId } });
        }}
      >
        <button type="submit" className="border">
          Add a todo
        </button>
      </form>

      <div className="mt-8 space-y-8">
        {optimisticTodos.map((todo) => (
          <div key={todo.clientId}>
            <p>ID: {todo.id}</p>
            <p>Client ID: {todo.clientId}</p>
            <form
              action={async (formData: FormData) => {
                const text = formData.get("text");
                if (typeof text !== "string") {
                  return;
                }

                await action({
                  type: "update",
                  payload: { clientId: todo.clientId, text },
                });
              }}
            >
              <input
                autoFocus
                placeholder="Text..."
                defaultValue={todo.text}
                name="text"
              />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
