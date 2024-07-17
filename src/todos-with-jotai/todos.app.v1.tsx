import { useState } from 'react';

import { DevTools } from 'jotai-devtools';
import 'jotai-devtools/styles.css';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import {
  allTodosAtom,
  searchFilterAtom,
  sortOrderAtom,
  statsAtom,
  todosAtom,
} from './todos.store.v1';
import type { Todo } from './todos.model';

function TodosPage() {
  return (
    <div>
      <TodosHeader />
      <TodosSearch />
      <TodosSort />
      <TodosStats />
      <TodoForm />
      <TodosList />
    </div>
  );
}

function TodosHeader() {
  return <h1>My Todos with Jotai (v1)</h1>;
}

function TodosStats() {
  const stats = useAtomValue(statsAtom);

  return (
    <p>
      All: {stats.total} | Done: {stats.done.value} ({stats.done.percentage}%) |
      Todo: {stats.notDone.value} ({stats.notDone.percentage}%)
    </p>
  );
}

function TodosSearch() {
  const [searchFilter, setSearchFilter] = useAtom(searchFilterAtom);

  return (
    <input
      type="text"
      placeholder="Search..."
      value={searchFilter}
      onChange={(e) => {
        setSearchFilter(e.target.value);
      }}
    />
  );
}

function TodosSort() {
  const [sortOrder, setSortOrder] = useAtom(sortOrderAtom);

  const options: Record<typeof sortOrder, { value: string; label: string }> = {
    asc: { value: 'asc', label: 'Sort ascending' },
    desc: { value: 'desc', label: 'Sort descedning' },
  };

  return (
    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
    >
      {Object.values(options).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function TodoForm() {
  const setAllTodos = useSetAtom(allTodosAtom);

  const [text, setText] = useState('');

  return (
    <div>
      <input
        type="text"
        placeholder="What needs to be done?"
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <button
        onClick={async () => {
          await setAllTodos({ type: 'create-todo', payload: { text } });
          setText('');
        }}
      >
        Create
      </button>
    </div>
  );
}

function TodosList() {
  const todos = useAtomValue(todosAtom);

  return (
    <ol>
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem todo={todo} />
        </li>
      ))}
    </ol>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const setAllTodos = useSetAtom(allTodosAtom);

  const [mode, setMode] = useState<'read' | 'write'>('read');
  const [text, setText] = useState(todo.text);

  const content: Record<typeof mode, JSX.Element> = {
    read: (
      <span>
        <span onClick={() => setMode('write')}>{todo.text}</span>
      </span>
    ),
    write: (
      <span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={async () => {
            await setAllTodos({
              type: 'update-todo',
              payload: { todoId: todo.id, updates: { text } },
            });
            setMode('read');
          }}
        >
          Confirm
        </button>
        <button
          onClick={() =>
            setAllTodos({
              type: 'remove-todo',
              payload: { todoId: todo.id },
            })
          }
        >
          Remove
        </button>
      </span>
    ),
  };

  return (
    <span>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={async () =>
          await setAllTodos({
            type: 'toggle-todo',
            payload: { todoId: todo.id },
          })
        }
      />
      {content[mode]}
    </span>
  );
}

export function TodosWithJotai() {
  return (
    <div>
      <DevTools />
      <TodosPage />
    </div>
  );
}
