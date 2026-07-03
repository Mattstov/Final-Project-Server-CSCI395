const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Campuses API is running')
})

// GET all campuses
app.get('/campuses', async (req, res) => {
  try {
    const campuses = await prisma.campus.findMany()
    res.json(campuses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campuses' })
  }
})

// GET single campus (with students)
app.get('/campuses/:id', async (req, res) => {
  try {
    const campus = await prisma.campus.findUnique({
      where: { id: Number(req.params.id) },
      include: { students: true },
    })
    if (!campus) return res.status(404).json({ error: 'Campus not found' })
    res.json(campus)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campus' })
  }
})

// POST create campus
app.post('/campuses', async (req, res) => {
  const { name, address, imageUrl, description } = req.body
  if (!name || !address || !description) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    const campus = await prisma.campus.create({
      data: { name, address, imageUrl, description },
    })
    res.status(201).json(campus)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campus' })
  }
})

// PUT update campus
app.put('/campuses/:id', async (req, res) => {
  const { name, address, imageUrl, description } = req.body
  if (!name || !address || !description) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    const campus = await prisma.campus.update({
      where: { id: Number(req.params.id) },
      data: { name, address, imageUrl, description },
    })
    res.json(campus)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Campus not found' })
    }
    res.status(500).json({ error: 'Failed to update campus' })
  }
})

// DELETE campus (unenroll students, don't delete them)
app.delete('/campuses/:id', async (req, res) => {
  try {
    await prisma.student.updateMany({
      where: { campusId: Number(req.params.id) },
      data: { campusId: null },
    })
    await prisma.campus.delete({
      where: { id: Number(req.params.id) },
    })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campus' })
  }
})

// --- Students ---

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateStudentInput({ firstName, lastName, email, gpa, campusId }, { partial = false } = {}) {
  if (!partial || firstName !== undefined) {
    if (!firstName) return 'First name is required'
  }
  if (!partial || lastName !== undefined) {
    if (!lastName) return 'Last name is required'
  }
  if (!partial || email !== undefined) {
    if (!email || !EMAIL_RE.test(email)) return 'A valid email is required'
  }
  if (!partial || gpa !== undefined) {
    const gpaNum = Number(gpa)
    if (gpa === undefined || gpa === null || Number.isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
      return 'GPA must be a number between 0.0 and 4.0'
    }
  }
  if (campusId !== undefined && campusId !== null && Number.isNaN(Number(campusId))) {
    return 'campusId must be a number or null'
  }
  return null
}

// GET all students
app.get('/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({ include: { campus: true } })
    res.json(students)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' })
  }
})

// GET single student (with campus)
app.get('/students/:id', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(req.params.id) },
      include: { campus: true },
    })
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json(student)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student' })
  }
})

// POST create student
app.post('/students', async (req, res) => {
  const { firstName, lastName, email, imageUrl, gpa, campusId } = req.body
  const validationError = validateStudentInput({ firstName, lastName, email, gpa, campusId })
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }
  try {
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        imageUrl,
        gpa: Number(gpa),
        campusId: campusId === undefined || campusId === null || campusId === '' ? null : Number(campusId),
      },
    })
    res.status(201).json(student)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already in use' })
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'campusId does not reference an existing campus' })
    }
    res.status(500).json({ error: 'Failed to create student' })
  }
})

// PUT update student (also used to change/clear a student's campus)
app.put('/students/:id', async (req, res) => {
  const { firstName, lastName, email, imageUrl, gpa, campusId } = req.body
  const validationError = validateStudentInput({ firstName, lastName, email, gpa, campusId }, { partial: true })
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }
  const data = {}
  if (firstName !== undefined) data.firstName = firstName
  if (lastName !== undefined) data.lastName = lastName
  if (email !== undefined) data.email = email
  if (imageUrl !== undefined) data.imageUrl = imageUrl
  if (gpa !== undefined) data.gpa = Number(gpa)
  if (campusId !== undefined) {
    data.campusId = campusId === null || campusId === '' ? null : Number(campusId)
  }
  try {
    const student = await prisma.student.update({
      where: { id: Number(req.params.id) },
      data,
    })
    res.json(student)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Student not found' })
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already in use' })
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'campusId does not reference an existing campus' })
    }
    res.status(500).json({ error: 'Failed to update student' })
  }
})

// DELETE student
app.delete('/students/:id', async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Student not found' })
    }
    res.status(500).json({ error: 'Failed to delete student' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
