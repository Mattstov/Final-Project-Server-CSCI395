# Campuses & Students - Server

Backend for the Campuses & Students CRUD app. Pairs with the [client repo](https://github.com/Mattstov/Final-Project-CSCI395).

A Campus has many Students. A Student belongs to at most one Campus, or none (unenrolled).

## Stack

- Node + Express
- Prisma ORM
- PostgreSQL (hosted on Neon)

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

## Deployed URL

- Backend: https://final-project-server-csci395.onrender.com/
