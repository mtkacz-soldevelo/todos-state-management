import { TodosWithReducer } from './todos-with-reducer';
import { TodosWithZustand } from './todos-with-zustand';

function App() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2rem',
      }}
    >
      <TodosWithReducer />
      <TodosWithZustand />
    </div>
  );
}

export default App;
