import { TodoTitle } from '../value-objects/TodoTitle.js';
import { DueDate } from '../value-objects/DueDate.js';

export interface TodoProps {
  id: number;
  userId: number;
  title: TodoTitle;
  description: string | null;
  dueDate: DueDate;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Todo {
  private id: number;
  private userId: number;
  private title: TodoTitle;
  private description: string | null;
  private dueDate: DueDate;
  private done: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: TodoProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.description = props.description;
    this.dueDate = props.dueDate;
    this.done = props.done;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    userId: number,
    title: string,
    description: string | null,
    dueDate: string
  ): Omit<TodoProps, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId,
      title: new TodoTitle(title),
      description,
      dueDate: new DueDate(dueDate),
      done: false,
    };
  }

  isOverdue(): boolean {
    return this.dueDate.isOverdue(this.done);
  }

  complete(): void {
    this.done = true;
    this.updatedAt = new Date();
  }

  uncomplete(): void {
    this.done = false;
    this.updatedAt = new Date();
  }

  toggleDone(): void {
    this.done = !this.done;
    this.updatedAt = new Date();
  }

  updateTitle(newTitle: string): void {
    this.title = new TodoTitle(newTitle);
    this.updatedAt = new Date();
  }

  updateDescription(newDescription: string | null): void {
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  updateDueDate(newDueDate: string): void {
    this.dueDate = new DueDate(newDueDate);
    this.updatedAt = new Date();
  }

  belongsTo(userId: number): boolean {
    return this.userId === userId;
  }

  // Getters
  getId(): number {
    return this.id;
  }

  getUserId(): number {
    return this.userId;
  }

  getTitle(): string {
    return this.title.getValue();
  }

  getDescription(): string | null {
    return this.description;
  }

  getDueDate(): string {
    return this.dueDate.getValue();
  }

  isDone(): boolean {
    return this.done;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
