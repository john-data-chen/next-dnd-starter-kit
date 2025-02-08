db = db.getSiblingDB('admin');
// move to the admin db - always created in Mongo
db.auth('root', '123456');
// log as root admin if you decided to authenticate in your docker-compose file...
db = db.getSiblingDB('next-template');
// create and move to your new database
db.createUser({
  user: 'dbUser',
  pwd: 'dbPwd',
  roles: [
    {
      role: 'dbOwner',
      db: 'next-template'
    }
  ]
});
// user created
