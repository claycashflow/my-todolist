export interface TodoResponseDTO {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  dueDate: string;
  done: boolean;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}
