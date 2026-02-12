export interface CreateTodoDTO {
  userId: number;
  title: string;
  description: string | null;
  dueDate: string;
}
