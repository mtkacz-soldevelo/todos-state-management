function TodosPage() {
  return (
    <div>
      <TodosHeader />
      {/* <TodosSearch />
      <TodosSort />
      <TodosStats />
      <TodoForm />
      <TodosList /> */}
    </div>
  );
}

function TodosHeader() {
  return <h1>My Todos with Zustand</h1>;
}

export function TodosWithZustand() {
  return <TodosPage />;
}
