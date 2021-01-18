const UserModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UserService {

  static async getAllUsers() {
    try {
      return await UserModel.findAll();
    } catch (error) {
      throw error;
    }
  }

  static async getUser(query) {
    try {
      return await UserModel.findOne({
        where: query,
      }).then(user => {
        return {
          id: user.id,
          login: user.login,
          avatar: user.avatar,
        };
      }).catch(() => {
        return false;
      });
    } catch (error) {
      throw error;
    }
  }

  static async createUser(data) {
    let result;
    try {
      await bcrypt.hash(data.password, 10)
        .then((hash) => {
          data.password = hash;
        }).catch(err => {
          return err;
        });

      const newUser = await UserModel.create(data);
      const token = this.generateToken(data);

      result = {
        id: newUser.id,
        login: newUser.login,
        avatar: newUser.avatar,
        token: token,
      };
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(id, updateUser) {
    try {
      const UserToUpdate = await UserModel.findOne({
        where: { id: Number(id) },
      });

      if (UserToUpdate) {
        await UserModel.update(updateUser, { where: { id: Number(id) } });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const UserToDelete = await UserModel.findOne({ where: { id: Number(id) } });

      if (UserToDelete) {
        return await UserModel.destroy({
          where: { id: Number(id) },
        });
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async login(data) {
    try {
      const verifiedUser = await UserModel.findOne({
        where: {
          login: data.login,
        },
      });
      if (verifiedUser) {
        return await bcrypt.compare(data.password, verifiedUser.password).then((hash) => {
          if (hash) {
            return {
              status: hash,
              userDetails: {
                id: verifiedUser.id,
                login: verifiedUser.login,
                avatar: verifiedUser.avatar,
                token: this.generateToken(data),
              },
            };
          } else {
            return {
              status: hash,
            };
          }

        }).catch(err => {
          return err;
        });
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  static generateToken(data) {
    return jwt.sign(
      {
        email: data.email,
        login: data.login,
      },
      process.env.JWT_KEY,
      {
        expiresIn: '1h',
      },
    );
  }
}

module.exports = UserService;