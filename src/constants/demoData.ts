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
    title: 'My First Project in personal board',
    description: 'This is demo project 1',
    boardIndex: 0
  },
  {
    title: 'Demo Project 2 in team board',
    description: 'This is demo project 2',
    boardIndex: 1
  },
  {
    title: 'Demo Project 3 in team board',
    description: 'This is demo project 3',
    boardIndex: 2
  }
];

export const demoTasks = [
  {
    title: 'Task 1',
    description: 'This is my first task',
    status: 'TODO',
    projectIndex: 0,
    assigneeIndex: 2,
    creatorIndex: 3
  },
  {
    title: 'Task 2',
    description: 'This is task 2',
    status: 'IN_PROGRESS',
    projectIndex: 1,
    assigneeIndex: 3,
    creatorIndex: 1
  },
  {
    title: 'Task 3',
    description: 'This is task 3',
    status: 'DONE',
    projectIndex: 2,
    assigneeIndex: 1,
    creatorIndex: 2
  }
];
