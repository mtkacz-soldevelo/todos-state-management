import { atom } from 'jotai';
import type { Todo } from './todos.model';
import { AsyncUtils, EntityUtils, MathUtils } from '../utils';
import { atomWithStorage } from 'jotai/utils';

const STORAGE_KEY = 'my-todos-with-jotai-v2';
const getStorageKey = (key: string): string => {
  return `${STORAGE_KEY}_${key}`;
};

type SortOrder = 'asc' | 'desc';

type CreateTodo = (todos: Todo[], text: Todo['text']) => Promise<Todo[]>;
type RemoveTodo = (todos: Todo[], todoId: Todo['id']) => Promise<Todo[]>;
type ToggleTodo = (todos: Todo[], todoId: Todo['id']) => Promise<Todo[]>;
type UpdateTodo = (
  todos: Todo[],
  todoId: Todo['id'],
  updates: Partial<Omit<Todo, 'id'>>
) => Promise<Todo[]>;

export const createTodo: CreateTodo = async (todos, text) => {
  await AsyncUtils.sleep();

  return [...todos, { id: EntityUtils.generateUniqueId(), text, done: false }];
};

export const removeTodo: RemoveTodo = async (todos, id) => {
  await AsyncUtils.sleep();

  return todos.filter((todo) => todo.id !== id);
};

export const toggleTodo: ToggleTodo = async (todos, id) => {
  await AsyncUtils.sleep();

  return todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
};

export const updateTodo: UpdateTodo = async (todos, id, updates) => {
  await AsyncUtils.sleep();

  return todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo));
};

export const allTodosAtom = atomWithStorage<Todo[]>(
  getStorageKey('all-todos'),
  []
);

export const searchFilterAtom = atomWithStorage(
  getStorageKey('search-filter'),
  ''
);

export const sortOrderAtom = atomWithStorage<SortOrder>(
  getStorageKey('sort-order'),
  'asc'
);

export const todosAtom = atom((get) => {
  const allTodos = get(allTodosAtom);
  const searchFilter = get(searchFilterAtom);
  const sortOrder = get(sortOrderAtom);

  return allTodos
    .filter((todo) => todo.text.includes(searchFilter))
    .sort(
      (a, b) => a.text.localeCompare(b.text) * (sortOrder === 'asc' ? 1 : -1)
    );
});

export const statsAtom = atom((get) => {
  const todos = get(todosAtom);

  if (todos.length === 0) {
    return {
      total: 0,
      done: { value: 0, percentage: 0 },
      notDone: { value: 0, percentage: 0 },
    };
  }

  const total = todos.length;

  const done = todos.filter((todo) => todo.done).length;
  const notDone = total - done;

  const donePercentage = MathUtils.calculatePercentage(done, total);
  const notDonePercentage = 100 - donePercentage;

  return {
    total,
    done: { value: done, percentage: donePercentage },
    notDone: { value: notDone, percentage: notDonePercentage },
  };
});

export const createTodoAtom = atom(
  null,
  async (get, set, { text }: { text: Todo['text'] }) => {
    const newAllTodos = await createTodo(get(allTodosAtom), text);
    set(allTodosAtom, newAllTodos);
  }
);

export const removeTodoAtom = atom(
  null,
  async (get, set, { todoId }: { todoId: Todo['id'] }) => {
    set(allTodosAtom, await removeTodo(get(allTodosAtom), todoId));
  }
);

export const toggleTodoAtom = atom(
  null,
  async (get, set, { todoId }: { todoId: Todo['id'] }) => {
    set(allTodosAtom, await toggleTodo(get(allTodosAtom), todoId));
  }
);

export const updateTodoAtom = atom(
  null,
  async (
    get,
    set,
    {
      todoId,
      updates,
    }: { todoId: Todo['id']; updates: Partial<Omit<Todo, 'id'>> }
  ) => {
    set(allTodosAtom, await updateTodo(get(allTodosAtom), todoId, updates));
  }
);
