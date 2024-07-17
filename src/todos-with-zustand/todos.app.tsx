import { useState } from 'react';
import { useTodosStore } from './todos.store';
import { type Todo } from './todos.model';

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
  return <h1>My Todos with Zustand</h1>;
}

function TodosStats() {
  const stats = useTodosStore((s) => s.stats);

  return (
    <p>
      All: {stats.total} | Done: {stats.done.value} ({stats.done.percentage}%) |
      Todo: {stats.notDone.value} ({stats.notDone.percentage}%)
    </p>
  );
}

function TodosSearch() {
  const searchFilter = useTodosStore((s) => s.searchFilter);
  const setSearchFilter = useTodosStore((s) => s.setSearchFilter);

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
  const sortOrder = useTodosStore((s) => s.sortOrder);
  const setSortOrder = useTodosStore((s) => s.setSortOrder);

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
  const createTodo = useTodosStore((s) => s.createTodo);

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
          await createTodo(text);
          setText('');
        }}
      >
        Create
      </button>
    </div>
  );
}

function TodosList() {
  const todos = useTodosStore((s) => s.todos);

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
  const toggleTodo = useTodosStore((s) => s.toggleTodo);
  const removeTodo = useTodosStore((s) => s.removeTodo);
  const updateTodo = useTodosStore((s) => s.updateTodo);

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
            await updateTodo(todo.id, { text });
            setMode('read');
          }}
        >
          Confirm
        </button>
        <button onClick={() => removeTodo(todo.id)}>Remove</button>
      </span>
    ),
  };

  return (
    <span>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={async () => await toggleTodo(todo.id)}
      />
      {content[mode]}
    </span>
  );
}

export function TodosWithZustand() {
  return <TodosPage />;
}
