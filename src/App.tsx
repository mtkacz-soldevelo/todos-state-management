import { useState } from 'react';
import { TodosProvider, useTodos, type Todo } from './todos';

function TodosPage() {
  const { isInitalized } = useTodos();

  if (!isInitalized) {
    return <TodosLoading />;
  }

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

function TodosLoading() {
  return <h1>Initializing...</h1>;
}

function TodosHeader() {
  return <h1>My Todos</h1>;
}

function TodosStats() {
  const { stats } = useTodos();

  return (
    <p>
      All: {stats.total} | Done: {stats.done.value} ({stats.done.percentage}%) |
      Todo: {stats.notDone.value} ({stats.notDone.percentage}%)
    </p>
  );
}

function TodosSearch() {
  const { searchFilter, setSearchFilter } = useTodos();

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
  const { sortOrder, setSortOrder } = useTodos();

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
  const { createTodo } = useTodos();

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
  const { todos } = useTodos();

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
  const { toggleTodo, removeTodo, updateTodo } = useTodos();

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

function App() {
  return (
    <TodosProvider>
      <TodosPage />
    </TodosProvider>
  );
}

export default App;
