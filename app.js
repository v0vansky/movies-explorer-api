const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors, celebrate, Joi } = require('celebrate');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-error');
const {
  PORT,
  DB_SERVER,
  NODE_ENV,
} = require('./utils/constants');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

mongoose.connect(DB_SERVER, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);
app.use('/users', usersRouter);
app.use('/movies', moviesRouter);
app.use('/*', (req, res, next) => {
  next(new NotFoundError('Указанный путь не найден'));
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(PORT, () => console.log(`App started at port ${PORT} in ${NODE_ENV} mode`));
