const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/course-authoring-login', async (req, res) => {
  try {
    console.log('Payload being sent:', req.body);
    console.log('Headers being sent:', {
      'Authorization': req.headers['authorization'],
      'Content-Type': 'application/json'
    });
    const response = await axios.post('https://proxy.personalized-learning.org/next.course-authoring/api/auth/x-login', req.body, {
      headers: {
        'Authorization': req.headers['authorization'],
        'Content-Type': 'application/json'
      }
    });
    console.log('Response received:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }
    res.status(error.response?.status || 500).json({ message: 'Failed to authenticate with course authoring tool' });
  }
});

module.exports = router;
