const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/queue
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const tokens = await prisma.queueToken.findMany({
      where,
      include: { patient: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve queue' });
  }
});

// POST /api/queue/checkin - FIX: Race condition fixed using transaction
router.post('/checkin', authenticate, async (req, res) => {
  try {
    const { patientId, appointmentId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'Patient ID is required.' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FIX: Use transaction to atomically get max token and create new one
    // Eliminates race condition where concurrent check-ins got same token number
    const newToken = await prisma.$transaction(async (tx) => {
      const maxTokenResult = await tx.queueToken.aggregate({
        where: { createdAt: { gte: today } },
        _max: { tokenNumber: true },
      });

      const nextTokenNumber = (maxTokenResult._max.tokenNumber || 0) + 1;

      return tx.queueToken.create({
        data: {
          tokenNumber: nextTokenNumber,
          patientId: parseInt(patientId),
          appointmentId: appointmentId ? parseInt(appointmentId) : null,
          status: 'waiting',
        },
        include: { patient: true },
      });
    });

    res.status(201).json({ message: 'Checked in successfully.', token: newToken });
  } catch (error) {
    console.error('Queue check-in error:', error);
    res.status(500).json({ error: 'Check-in failed' });
  }
});

// PATCH /api/queue/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updatedToken = await prisma.queueToken.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { patient: true },
    });
    res.json(updatedToken);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update queue token' });
  }
});

module.exports = router;
