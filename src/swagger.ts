import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const filePath = path.join(__dirname, '../openapi.yaml');
const file = fs.readFileSync(filePath, 'utf8');
const swaggerDocument = yaml.parse(file);

export function setupSwagger(app: any) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
