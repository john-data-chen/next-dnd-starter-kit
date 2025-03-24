export const defaultEmail = 'mark.s@example.com';

export const defaultDbUrl =
  'mongodb://root:123456@localhost:27017/next-template?authSource=admin';

export const demoUsers = [
  {
    email: 'admin@example.com',
    name: 'Admin',
    role: 'ADMIN'
  },
  {
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'USER'
  },
  {
    email: 'jane.doe@example.com',
    name: 'Jane Doe',
    role: 'USER'
  },
  {
    email: 'mark.s@example.com',
    name: 'Mark S',
    role: 'USER'
  }
];

export const demoBoards = [
  {
    title: "Mark's Kanban",
    description: 'My personal tasks and projects'
  },
  {
    title: "John's Kanban",
    description: 'My personal tasks and projects'
  },
  {
    title: "Jane's Kanban",
    description: 'My personal tasks and projects'
  },
  {
    title: 'Dev Team Board',
    description: 'public board for Dev Team'
  },
  {
    title: 'Marketing Board',
    description: 'public board for Marketing Team'
  }
];

export const demoProjects = [
  {
    title: "Mark's todo list",
    description: 'This is demo project 1'
  },
  {
    title: 'Demo Project 2 in team board',
    description: 'This is demo project 2'
  },
  {
    title: 'Demo Project 3 in team board',
    description: 'This is demo project 3'
  }
];

export const demoTasks = [
  {
    title: 'Task 1',
    description: 'This is my first task',
    status: 'TODO'
  },
  {
    title: 'Task 2',
    description: 'This is task 2',
    status: 'IN_PROGRESS'
  },
  {
    title: 'Task 3',
    description: 'This is task 3',
    status: 'DONE'
  }
];
