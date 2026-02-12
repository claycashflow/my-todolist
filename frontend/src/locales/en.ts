import type { TranslationKeys } from './ko';

export const en: TranslationKeys = {
  // Common
  common: {
    email: 'Email',
    password: 'Password',
    username: 'Username',
    title: 'Title',
    description: 'Description',
    dueDate: 'Due Date',
    submit: 'Submit',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    loading: 'Loading...',
    logout: 'Logout',
    hello: 'Hello',
  },

  // Login
  login: {
    title: 'Login',
    button: 'Login',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
  },

  // Register
  register: {
    title: 'Sign Up',
    button: 'Sign Up',
    hasAccount: 'Already have an account?',
    signIn: 'Sign In',
    usernamePlaceholder: '4-20 characters, alphanumeric only',
    passwordPlaceholder: 'At least 8 characters',
    confirmPassword: 'Confirm Password',
    usernameInvalid: 'Username must be 4-20 alphanumeric characters',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    usernameTaken: 'Username is already taken',
    success: 'Registration successful. Please login.',
    processing: 'Processing...',
  },

  // Todo
  todo: {
    title: 'Todo List',
    addNew: '+ Add New Todo',
    addTitle: 'Add New Todo',
    editTitle: 'Edit Todo',
    done: 'Completed',
    overdue: 'Overdue',
    empty: 'No todos yet',
    emptyIcon: '📝',
    titlePlaceholder: '1-100 characters',
    descriptionPlaceholder: 'Max 1000 characters',
    updateButton: 'Update',
    addButton: 'Add',
    deleteConfirm: 'Are you sure you want to delete?',
    deleteMessage: 'This todo will be permanently deleted.',
    deleteButton: 'Delete',
    upcomingSection: 'Upcoming',
    completedSection: 'Completed',
    emptyUpcoming: 'No upcoming todos',
    emptyCompleted: 'No completed todos',
  },

  // Error messages
  errors: {
    titleRequired: 'Title must be at least 1 character',
    titleTooLong: 'Title must be less than 100 characters',
    dueDateRequired: 'Please enter a valid due date',
    saveFailed: 'Failed to save todo. Please try again.',
    loginFailed: 'Invalid username or password',
    registerFailed: 'Registration failed',
  },
};
