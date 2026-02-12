export interface UpdateTodoDTO {
  title?: string;
  description?: string | null;
  dueDate?: string;
  done?: boolean;
}
