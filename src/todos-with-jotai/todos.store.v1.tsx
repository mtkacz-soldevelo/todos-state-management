import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Todo } from './todos.model';
import { EntityUtils, MathUtils } from '../utils';

const STORAGE_KEY = 'my-todos-with-jotai-v1';
const getStorageKey = (key: string): string => {
  return `${STORAGE_KEY}_${key}`;
};

type SortOrder = 'asc' | 'desc';

// // Using atomWithReducer, but it cannot be combined with atomWithStorage
// export const allTodosAtom2 = atomWithReducer<
//   Todo[],
//   | {
//       type: 'create-todo';
//       payload: { text: string };
//     }
//   | {
//       type: 'remove-todo';
//       payload: { todoId: Todo['id'] };
//     }
//   | {
//       type: 'update-todo';
//       payload: {
//         todoId: Todo['id'];
//         updates: Partial<Omit<Todo, 'id'>>;
//       };
//     }
//   | {
//       type: 'toggle-todo';
//       payload: { todoId: Todo['id'] };
//     }
// >([], (state, action) => {
//   if (!action) {
//     return state;
//   }

//   switch (action.type) {
//     case 'create-todo': {
//       if (!action.payload.text.trim()) {
//         return state;
//       }

//       return [
//         ...state,
//         { ...action.payload, id: EntityUtils.generateUniqueId(), done: false },
//       ];
//     }
//     case 'remove-todo': {
//       return state.filter((todo) => todo.id !== action.payload.todoId);
//     }
//     case 'update-todo': {
//       return state.map((todo) =>
//         todo.id === action.payload.todoId
//           ? { ...todo, ...action.payload.updates }
//           : todo
//       );
//     }
//     case 'toggle-todo': {
//       return state.map((todo) =>
//         todo.id === action.payload.todoId ? { ...todo, done: !todo.done } : todo
//       );
//     }
//     default: {
//       const _exhaustiveCheck: never = action;
//       throw new Error('Invalid action type');
//     }
//   }
// });

const allTodosAtomWithStorage = atomWithStorage<Todo[]>(
  getStorageKey('all-todos'),
  []
);

type Action =
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
    };

const allTodosReducer = (state: Todo[], action: Action): Todo[] => {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case 'create-todo': {
      if (!action.payload.text.trim()) {
        return state;
      }

      return [
        ...state,
        {
          ...action.payload,
          id: EntityUtils.generateUniqueId(),
          done: false,
        },
      ];
    }
    case 'remove-todo': {
      return state.filter((todo) => todo.id !== action.payload.todoId);
    }
    case 'update-todo': {
      return state.map((todo) =>
        todo.id === action.payload.todoId
          ? { ...todo, ...action.payload.updates }
          : todo
      );
    }
    case 'toggle-todo': {
      return state.map((todo) =>
        todo.id === action.payload.todoId ? { ...todo, done: !todo.done } : todo
      );
    }
    default: {
      const _exhaustiveCheck: never = action;
      throw new Error('Invalid action type');
    }
  }
};

export const allTodosAtom = atom(
  (get) => get(allTodosAtomWithStorage),
  (get, set, action: Action) => {
    set(
      allTodosAtomWithStorage,
      allTodosReducer(get(allTodosAtomWithStorage), action)
    );
  }
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
