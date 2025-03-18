export const defaultEmail = 'admin@example.com';

export const defaultDbUrl =
  'mongodb://root:123456@localhost:27017/next-template?authSource=admin';

export const demoUsers = [
  {
    email: defaultEmail,
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
  }
];

export const demoBoards = [
  {
    title: 'Personal Board',
    description: 'My personal tasks and projects'
  },
  {
    title: 'Team Board',
    description: 'Collaborative team projects'
  }
];

export const demoProjects = [
  {
    title: 'Demo Project 1',
    description: 'This is demo project 1',
    boardIndex: 0
  },
  {
    title: 'Demo Project 2',
    description: 'This is demo project 2',
    boardIndex: 1
  }
];

export const demoTasks = [
  {
    title: 'Task 1',
    description: 'This is our first task',
    status: 'TODO',
    projectIndex: 0,
    assigneeIndex: 1,
    creatorIndex: 0
  },
  {
    title: 'Task 2',
    description: 'This is task 2',
    status: 'IN_PROGRESS',
    projectIndex: 0,
    assigneeIndex: 1,
    creatorIndex: 2
  },
  {
    title: 'Task 3',
    description: 'This is task 3',
    status: 'DONE',
    projectIndex: 1,
    assigneeIndex: 1,
    creatorIndex: 0
  }
];
