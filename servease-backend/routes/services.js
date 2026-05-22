const express = require('express');
const Service = require('../models/Service');
const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed default services (call once)
router.post('/seed', async (req, res) => {
  const defaults = [
    { name: 'House Cleaning', category: 'Home Care', description: 'Professional deep cleaning', basePrice: 500, icon: '🧹', badge: 'popular' },
    { name: 'Plumbing Repair', category: 'Maintenance', description: 'Expert plumbing', basePrice: 400, icon: '🔧', badge: 'available' },
    { name: 'AC Service', category: 'Maintenance', description: 'AC installation & repair', basePrice: 600, icon: '❄️', badge: 'new' },
    { name: 'Electrical Work', category: 'Maintenance', description: 'Professional electrician', basePrice: 550, icon: '⚡', badge: 'popular' },
    { name: 'Painting', category: 'Renovation', description: 'Interior & exterior', basePrice: 800, icon: '🎨', badge: 'available' },
    { name: 'Pest Control', category: 'Home Care', description: 'Safe pest control', basePrice: 450, icon: '🦟', badge: 'popular' }
  ];
  await Service.insertMany(defaults);
  res.json({ message: 'Seeded' });
});

module.exports = router;