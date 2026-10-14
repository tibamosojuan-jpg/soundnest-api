import express from 'express';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/index.js';
import openApiDocument from './config/openApi.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
