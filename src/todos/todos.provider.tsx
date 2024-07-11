import { createContext, useContext, ReactNode } from 'react';
import { useTodosSource } from './todos.store';

const TodosContext = createContext<
  ReturnType<typeof useTodosSource> | undefined
>(undefined);

export function useTodos() {
  const context = useContext(TodosContext);

  if (!context) {
    throw new Error('useTodos must be used within a TodosProvider');
  }

  return context;
}

export function TodosProvider({ children }: { children: ReactNode }) {
  return (
    <TodosContext.Provider value={useTodosSource()}>
      {children}
    </TodosContext.Provider>
  );
}
