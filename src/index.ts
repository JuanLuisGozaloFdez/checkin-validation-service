import express from 'express';
const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'checkin-validation-service' });
});

app.listen(PORT, () => {
  console.log(`Check-in Validation Service running on port ${PORT}`);
});
