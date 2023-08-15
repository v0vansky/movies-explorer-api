const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { STATUS_CREATED, JWT_SECRET } = require('../utils/constants');
const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error');

const { ValidationError, CastError } = mongoose.Error;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        email,
        password: hash,
      })
        .then((user) => {
          res.status(STATUS_CREATED).send({
            name,
            email,
            _id: user._id,
          });
        })
        .catch((err) => {
          if (err instanceof ValidationError) {
            next(new BadRequestError('Переданы некорректные данные в метод создания пользователя.'));
            return;
          }
          if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует.'));
            return;
          }
          next(err);
        });
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  let id = req.params.userId;
  if (!id) {
    id = req.user._id;
  }
  User.findById({ _id: id })
    .orFail(() => {
      next(new NotFoundError('Пользователь с данным ID не найден'));
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Передан некорректные данные в метод поиска пользователя.'));
        return;
      }
      next(err);
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      next(new NotFoundError('Пользователь с данным ID не найден'));
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Передан некорректные данные в метод поиска пользователя.'));
        return;
      }
      next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные в метод обновления данных пользователя.'));
        return;
      }
      next(err);
    });
};
