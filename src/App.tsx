import { TodosWithReducer } from './todos-with-reducer';
import { TodosWithZustand } from './todos-with-zustand';
import { TodosWithJotaiV1, TodosWithJotaiV2 } from './todos-with-jotai';

function App() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
      }}
    >
      <TodosWithReducer />
      <TodosWithZustand />
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '2rem',
        }}
      >
        <TodosWithJotaiV1 />
        <TodosWithJotaiV2 />
      </div>
    </div>
  );
}

export default App;
