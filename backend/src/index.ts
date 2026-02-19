import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import './db';

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
