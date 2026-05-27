const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({ where: { email: 'admin@haqms.com' }, update: {}, create: { email: 'admin@haqms.com', password: hashedPassword, role: 'admin', name: 'Admin User' } });
  await prisma.user.upsert({ where: { email: 'reception1@haqms.com' }, update: {}, create: { email: 'reception1@haqms.com', password: hashedPassword, role: 'receptionist', name: 'Reception One' } });
  const doctorUser = await prisma.user.upsert({ where: { email: 'doctor1@haqms.com' }, update: {}, create: { email: 'doctor1@haqms.com', password: hashedPassword, role: 'doctor', name: 'Dr. Strange' } });
  const doctor = await prisma.doctor.upsert({ where: { email: 'doctor1@haqms.com' }, update: {}, create: { name: 'Dr. Strange', specialty: 'General Medicine', email: 'doctor1@haqms.com', userId: doctorUser.id } });
  const clark = await prisma.patient.upsert({ where: { id: 1 }, update: {}, create: { name: 'Clark Kent', email: 'clark@dailyplanet.com', phone: '9876543210' } });
  const bruce = await prisma.patient.upsert({ where: { id: 2 }, update: {}, create: { name: 'Bruce Wayne', email: 'bruce@wayne.com', phone: '9876543211' } });
  const diana = await prisma.patient.upsert({ where: { id: 3 }, update: {}, create: { name: 'Diana Prince', email: 'diana@themyscira.com', phone: '9876543212' } });
  const now = new Date();
  const slot1 = await prisma.slot.upsert({ where: { doctorId_startTime: { doctorId: doctor.id, startTime: new Date(now.getTime() + 3600000) } }, update: {}, create: { doctorId: doctor.id, startTime: new Date(now.getTime() + 3600000), endTime: new Date(now.getTime() + 7200000), isBooked: true } });
  const apt1 = await prisma.appointment.upsert({ where: { slotId: slot1.id }, update: {}, create: { patientId: clark.id, doctorId: doctor.id, slotId: slot1.id, status: 'scheduled' } });
  await prisma.queueToken.upsert({ where: { appointmentId: apt1.id }, update: {}, create: { tokenNumber: 1, patientId: clark.id, appointmentId: apt1.id, status: 'waiting' } });
  await prisma.medicalHistory.create({ data: { patientId: diana.id, notes: 'No known allergies', diagnosis: 'Healthy' } });
  console.log('Seed complete!');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
