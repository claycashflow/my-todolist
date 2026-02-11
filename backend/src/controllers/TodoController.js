import TodoService from '../services/TodoService.js';

class TodoController {
  async getTodos(req, res, next) {
    try {
      const userId = req.user.id;
      const todos = await TodoService.getUserTodos(userId);
      res.status(200).json({ success: true, data: todos });
    } catch (error) {
      next(error);
    }
  }

  async getTodo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const todo = await TodoService.getTodo(id, userId);
      res.status(200).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async createTodo(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, description, dueDate } = req.body;
      const todo = await TodoService.createTodo(userId, title, description, dueDate);
      res.status(201).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async updateTodo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const todo = await TodoService.updateTodo(id, userId, req.body);
      res.status(200).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async deleteTodo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await TodoService.deleteTodo(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TodoController();