import { create } from 'zustand';
import type { Todo } from './todos.model';
import { AsyncUtils, EntityUtils, MathUtils } from '../../utils';
import { persist } from 'zustand/middleware';

type SortOrder = 'asc' | 'desc';

type State = {
  allTodos: Todo[];
  todos: Todo[];
  searchFilter: string;
  sortOrder: SortOrder;
  stats: {
    total: number;
    done: { value: number; percentage: number };
    notDone: { value: number; percentage: number };
  };
};

type Action = {
  setAllTodos: (allTodos: Todo[]) => void;
  createTodo: (text: Todo['text']) => Promise<void>;
  removeTodo: (id: Todo['id']) => Promise<void>;
  toggleTodo: (id: Todo['id']) => Promise<void>;
  updateTodo: (
    id: Todo['id'],
    updates: Partial<Omit<Todo, 'id'>>
  ) => Promise<void>;
  setSearchFilter: (searchFilter: string) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
};

type Store = State & Action;

const STORAGE_KEY = 'my-todos-with-zustand';

const filterAndSortTodos = (
  allTodos: State['allTodos'],
  searchFilter: State['searchFilter'],
  sortOrder: State['sortOrder']
): State['todos'] => {
  return allTodos
    .filter((todo) => todo.text.includes(searchFilter))
    .sort(
      (a, b) => a.text.localeCompare(b.text) * (sortOrder === 'asc' ? 1 : -1)
    );
};

const calculateStats = (todos: State['todos']): State['stats'] => {
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
};

export const useTodosStore = create<Store>()(
  persist(
    (set, get) => ({
      allTodos: [],
      todos: [],
      searchFilter: '',
      sortOrder: 'asc',
      stats: calculateStats([]),

      setAllTodos: (allTodos) => {
        const todos = filterAndSortTodos(
          allTodos,
          get().searchFilter,
          get().sortOrder
        );
        const stats = calculateStats(todos);

        return set({
          allTodos,
          todos,
          stats,
        });
      },

      createTodo: async (text) => {
        await AsyncUtils.sleep();
        return get().setAllTodos([
          ...get().todos,
          { id: EntityUtils.generateUniqueId(), text, done: false },
        ]);
      },

      removeTodo: async (id) => {
        await AsyncUtils.sleep();
        return get().setAllTodos(get().todos.filter((todo) => todo.id !== id));
      },

      toggleTodo: async (id) => {
        await AsyncUtils.sleep();
        return get().setAllTodos(
          get().todos.map((todo) =>
            todo.id === id ? { ...todo, done: !todo.done } : todo
          )
        );
      },

      updateTodo: async (id, updates) => {
        await AsyncUtils.sleep();

        return get().setAllTodos(
          get().todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo
          )
        );
      },

      setSearchFilter: (searchFilter) => {
        const todos = filterAndSortTodos(
          get().allTodos,
          searchFilter,
          get().sortOrder
        );
        const stats = calculateStats(todos);

        return set(() => ({
          searchFilter,
          todos,
          stats,
        }));
      },

      setSortOrder: (sortOrder) => {
        const todos = filterAndSortTodos(
          get().allTodos,
          get().searchFilter,
          sortOrder
        );
        const stats = calculateStats(todos);

        return set(() => ({
          sortOrder,
          todos,
          stats,
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        allTodos: state.allTodos,
        todos: state.todos,
        searchFilter: state.searchFilter,
        sortOrder: state.sortOrder,
        stats: state.stats,
      }),
    }
  )
);
