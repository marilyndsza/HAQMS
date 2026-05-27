const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/doctor-stats
// FIX: Replaced sequential N+1 loop with parallel Promise.all queries
router.get('/doctor-stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doctors = await prisma.doctor.findMany();

    // FIX: All doctor queries run in parallel instead of sequentially
    const reportData = await Promise.all(
      doctors.map(async (doc) => {
        const [totalAppointments, completedAppointments, cancelledAppointments, queueTokensCount] =
          await Promise.all([
            prisma.appointment.count({ where: { doctorId: doc.id } }),
            prisma.appointment.count({ where: { doctorId: doc.id, status: 'COMPLETED' } }),
            prisma.appointment.count({ where: { doctorId: doc.id, status: 'CANCELLED' } }),
            prisma.queueToken.count({ where: { createdAt: { gte: today } } }),
          ]);

        return {
          id: doc.id,
          name: doc.name,
          specialty: doc.specialty,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          todayQueueSize: queueTokensCount,
        };
      })
    );

    res.json({ success: true, timeTakenMs: Date.now() - start, data: reportData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
