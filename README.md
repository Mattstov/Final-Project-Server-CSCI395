# Campuses & Students - Server

Backend for the Campuses & Students CRUD app. Pairs with the [client repo](https://github.com/Mattstov/Final-Project-CSCI395).

A Campus has many Students. A Student belongs to at most one Campus, or none (unenrolled).

## Stack

- Node + Express
- Prisma ORM
- PostgreSQL (hosted on Neon)

## Run Locally

1. Clone this repository and move into the server folder:

```bash
cd campuses-server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `campuses-server/` with your database connection string:

```bash
DATABASE_URL="your_postgres_connection_string"
PORT=3001
```

4. Run migrations and seed data (optional but recommended for first setup):

```bash
npx prisma migrate deploy
npx prisma db seed
```

5. Start the API:

```bash
npm run dev
```

The API will run at `http://localhost:3001` unless you set a different `PORT`.

## Endpoints

```
GET    /campuses
GET    /campuses/:id      (includes enrolled students)
POST   /campuses
PUT    /campuses/:id
DELETE /campuses/:id      (unenrolls its students instead of deleting them)

GET    /students
GET    /students/:id      (includes its campus, if any)
POST   /students
PUT    /students/:id      (also used to change or clear a student's campus)
DELETE /students/:id
```
## Errors and Params

All writes are validated server-side. 
Missing/invalid fields return a 400 with an error message. 
A student's email must be unique and a valid email format. 
GPA must be between 0.0 and 4.0.

## Deployed URLs

- Backend: https://final-project-server-csci395.onrender.com/
- Frontend (paired client app): https://final-project-csci395-i7qmeomjz-asm-web-dev.vercel.app
