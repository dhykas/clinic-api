import app from './app';
import dotenv from 'dotenv';
import { setupSwagger } from './swagger';

dotenv.config();

const PORT = process.env.PORT || 3000;
setupSwagger(app);


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
