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
  try {
    const campus = await prisma.campus.update({
      where: { id: Number(req.params.id) },
      data: { name, address, imageUrl, description },
    })
    res.json(campus)
  } catch (err) {
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})