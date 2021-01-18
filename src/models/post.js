const { sequelize, Sequelize } = require('../database/connection');


const post = sequelize.define('posts', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: Sequelize.INTEGER,
  },
  user: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  comment: Sequelize.STRING,
  photo: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  location: {
    type: Sequelize.STRING,
  },
});

module.exports = post;