import { getTodos } from '@/app/actions';
import Todos from '@/app/todos';

export default async function Home() {
  const todos = await getTodos();

  return <Todos todos={todos} />;
}
