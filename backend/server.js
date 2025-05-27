require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const cookieParser  = require('cookie-parser');
const helmet        = require('helmet');
const pino          = require('pino');
const pinoHttp      = require('pino-http');
const { sequelize } = require('./models');

/* ────── Routers ────── */
const authRoutes        = require('./routes/auth');
const enrollmentRoutes  = require('./routes/enrollments');
const usersRoutes       = require('./routes/users');
const coursesRoutes     = require('./routes/courses');
const authoringRoutes   = require('./routes/authoring');
const sessionsRoutes    = require('./routes/sessions');
const modulesRoutes     = require('./routes/modules');
const proxyRoutes       = require('./routes/proxy');

/* ────── Middleware ────── */
const errorHandler = require('./middlewares/errorHandler');

const app   = express();
const PORT  = process.env.PORT || 3000;
const log   = pino({ level: process.env.LOG_LEVEL || 'info' });

/* -------------------------------------------------------------- */
/*  Global middleware                                             */
/* -------------------------------------------------------------- */
app.use(pinoHttp({ logger: log }));
app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------------------------------------------------- */
/*  API routes                                                    */
/* -------------------------------------------------------------- */
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',        authRoutes);
app.use('/api/users',       usersRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses',     coursesRoutes);
app.use('/api/authoring',   authoringRoutes);
app.use('/api/sessions',    sessionsRoutes);
app.use('/api/modules',     modulesRoutes);
app.use('/api/proxy',       proxyRoutes);

/* -------------------------------------------------------------- */
/*  404 handler (after all routes)                                */
/* -------------------------------------------------------------- */
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

/* -------------------------------------------------------------- */
/*  Error-handling middleware – keep LAST                         */
/* -------------------------------------------------------------- */
app.use(errorHandler);

/* -------------------------------------------------------------- */
/*  Start                                                          */
/* -------------------------------------------------------------- */
(async () => {
  try {
    await sequelize.authenticate();
    log.info('Database connected');
    await sequelize.sync({ force: false });
    log.info('Models synced');
    console.log('Session associations:', Object.keys(require('./models').Session.associations));
    app.listen(PORT, () => log.info(`Server running on port ${PORT}`));
  } catch (err) {
    log.error('Startup failure:', err);
    process.exit(1);
  }
})();

module.exports = app;
