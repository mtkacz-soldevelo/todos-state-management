import { useReducer, Reducer, useMemo, useCallback, useEffect } from 'react';
import { AsyncUtils, MathUtils, EntityUtils } from '../utils';
import { Todo } from './todos.model';
import { LocalStorageService } from '../services';

type SortOrder = 'asc' | 'desc';

type TodosReducer = Reducer<
  {
    todos: Todo[];
    searchFilter: string;
    sortOrder: SortOrder;
    isInitalized: boolean;
  },
  | {
      type: 'load-todos';
      payload: {
        todos: Todo[];
        searchFilter: string;
        sortOrder: SortOrder;
      } | null;
    }
  | {
      type: 'create-todo';
      payload: { text: string };
    }
  | {
      type: 'remove-todo';
      payload: { todoId: Todo['id'] };
    }
  | {
      type: 'update-todo';
      payload: {
        todoId: Todo['id'];
        updates: Partial<Omit<Todo, 'id'>>;
      };
    }
  | {
      type: 'toggle-todo';
      payload: { todoId: Todo['id'] };
    }
  | {
      type: 'set-search-filter';
      payload: { searchFilter: string };
    }
  | {
      type: 'set-sort-order';
      payload: { sortOrder: SortOrder };
    }
>;

const todosReducer: TodosReducer = (state, action) => {
  switch (action.type) {
    case 'load-todos': {
      if (!action.payload) {
        return { ...state, isInitalized: true };
      }

      return {
        ...state,
        ...action.payload,
        isInitalized: true,
      };
    }
    case 'create-todo': {
      if (!action.payload.text.trim()) {
        return state;
      }

      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: EntityUtils.generateUniqueId(),
            text: action.payload.text.trim(),
            done: false,
          },
        ],
      };
    }
    case 'remove-todo': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.todoId),
      };
    }
    case 'update-todo': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.todoId
            ? { ...todo, ...action.payload.updates }
            : todo
        ),
      };
    }
    case 'toggle-todo': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.todoId
            ? { ...todo, done: !todo.done }
            : todo
        ),
      };
    }
    case 'set-search-filter': {
      return {
        ...state,
        ...action.payload,
      };
    }
    case 'set-sort-order': {
      return {
        ...state,
        ...action.payload,
      };
    }
    default: {
      const _exhaustiveCheck: never = action;
      throw new Error('Invalid action type');
    }
  }
};

const STORAGE_KEY = 'my-todos-with-reducer';

export function useTodosSource() {
  const [{ todos, searchFilter, sortOrder, isInitalized }, dispatch] =
    useReducer<TodosReducer>(todosReducer, {
      todos: [],
      searchFilter: '',
      sortOrder: 'asc',
      isInitalized: false,
    });

  useEffect(() => {
    const saveState = () => {
      LocalStorageService.writeLocalStorage(
        STORAGE_KEY,
        JSON.stringify({ todos, searchFilter, sortOrder })
      );
    };

    if (isInitalized) {
      saveState();
    }
  }, [todos, searchFilter, sortOrder, isInitalized]);

  useEffect(() => {
    const loadState = async () => {
      await AsyncUtils.sleep();

      const state = LocalStorageService.readLocalStorage(STORAGE_KEY);
      const parsedState = state ? JSON.parse(state) : null;
      dispatch({ type: 'load-todos', payload: parsedState });
    };

    loadState();
  }, []);

  const filteredTodos = useMemo(
    () =>
      todos.filter((todo) =>
        todo.text.toLocaleLowerCase().includes(searchFilter)
      ),
    [todos, searchFilter]
  );

  const sortedTodos = useMemo(
    () =>
      [...filteredTodos].sort(
        (a, b) => a.text.localeCompare(b.text) * (sortOrder === 'asc' ? 1 : -1)
      ),
    [filteredTodos, sortOrder]
  );

  const stats = useMemo(() => {
    const total = filteredTodos.length;

    const done = filteredTodos.filter((todo) => todo.done).length;
    const notDone = total - done;

    const donePercentage = MathUtils.calculatePercentage(done, total);
    const notDonePercentage = 100 - donePercentage;

    return {
      total,
      done: { value: done, percentage: donePercentage },
      notDone: { value: notDone, percentage: notDonePercentage },
    };
  }, [filteredTodos]);

  const createTodo = useCallback(async (text: string) => {
    await AsyncUtils.sleep();

    dispatch({ type: 'create-todo', payload: { text } });
  }, []);

  const removeTodo = useCallback(async (todoId: Todo['id']) => {
    await AsyncUtils.sleep();

    dispatch({ type: 'remove-todo', payload: { todoId } });
  }, []);

  const updateTodo = useCallback(
    async (todoId: Todo['id'], updates: Partial<Omit<Todo, 'id'>>) => {
      await AsyncUtils.sleep();

      dispatch({ type: 'update-todo', payload: { todoId, updates } });
    },
    []
  );

  const toggleTodo = useCallback(async (todoId: Todo['id']) => {
    await AsyncUtils.sleep();

    dispatch({ type: 'toggle-todo', payload: { todoId } });
  }, []);

  const setSortOrder = useCallback((sortOrder: SortOrder) => {
    dispatch({ type: 'set-sort-order', payload: { sortOrder } });
  }, []);

  const setSearchFilter = useCallback((searchFilter: string) => {
    dispatch({ type: 'set-search-filter', payload: { searchFilter } });
  }, []);

  return {
    todos: sortedTodos,
    stats,
    searchFilter,
    sortOrder,
    createTodo,
    removeTodo,
    updateTodo,
    toggleTodo,
    setSortOrder,
    setSearchFilter,
    isInitalized,
  };
}
