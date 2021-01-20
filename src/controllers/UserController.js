const UserService = require('../services/UserService');

const fs = require('fs');
const os = require('os');
const path = require('path');
const UUID = require('uuid-v4');
const Busboy = require('busboy');


class UserController {

  static async getAllUsers(req, res) {
    try {
      const allUsers = await UserService.getAllUsers();
      if (allUsers.length > 0) {
        return res.status(200).json({
          status: 200,
          data: allUsers,
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: 'User not found',
        });
      }
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: error,
      });
    }
  }

  static async getUser(req, res) {
    let { query } = req;
    console.log(query, 'queryyyyyyyyyyyyyyyyyyyy');
    try {
      const user = await UserService.getUser(query);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: `Cannot find user`,
        });
      } else {
        return res.status(200).json({
          status: 200,
          data: user,
        });
      }
    } catch (error) {
      return res.status(404).json({
        status: 404,
        message: error,
      });
    }
  }

  static async createUser(req, res) {
    if (!req.body.email || !req.body.login || !req.body.password) {
      return res.status(400).json({
        message: 'Please provide complete details',
      });
    }
    const body = req.body;
    try {
      const createdUser = await UserService.createUser(body);
      return res.status(201).json({
        status: 201,
        data: createdUser,
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: error,
      });
    }
  }

  static async updatedUser(req, res) {
    const body = req.body;
    if (!Number(body.userID)) {
      return res.status(400).json({
        status: 400,
        message: 'Please input a valid id value',
      });
    }
    try {
      if (body) {
        let fields = {};
        let fileData = {};
        const uuid = UUID();
        const busboy = new Busboy({ headers: req.headers });

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          let filepath = path.join(os.tmpdir(), filename);
          file.pipe(fs.createWriteStream(filepath));
          fileData = { filepath, mimetype };
          // /tmp/filename;
        });

        busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
          fields[fieldname] = val;
        });

        busboy.on('finish', () => {
          bucket.upload(
            fileData.filepath,
            {
              uploadType: 'media',
              metadata: {
                metadata: {
                  contentType: fileData.mimetype,
                  firebaseStorageDownloadTokens: uuid,
                },
              },
            },
            async (err, uploadedFile) => {
              if (!err) {
                fields.photo = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`;

                const data = await UserService.updateUser(fields.userID, fields);
                return res.status(201).json({
                  status: 201,
                  message: 'New post created',
                  data: data,
                });
              } else {
                return res.status(501).json({
                  status: 501,
                  message: err,
                });
              }
            },
          );
        });
        req.pipe(busboy);
      }
      const updateUser = await UserService.updateUser(body.userID, body);
      if (!updateUser) {
        return res.status(404).json({
          status: 404,
          message: `Cannot find user with the id: ${body.id}`,
        });
      } else {
        return res.status(200).json({
          status: 200,
          message: `User with id: ${body.id} updated`,
        });
      }
    } catch (error) {
      return res.status(404).json({
        status: 404,
        message: error,
      });
    }
  }

  static async loginUser(req, res) {
    const { query } = req;
    try {
      const result = await UserService.login(query);
      if (result.status) {
        return res.status(200).json({
          status: 200,
          data: result.userDetails,
        });
      } else {
        return res.status(400).json({
          status: 400,
          message: 'Please input valide password value',
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /*static async deleteUser(req, res) {
    const { id } = req.params;

    if (!Number(id)) {
      return res.status(400).json({
        status: 400,
        message: 'Please input a valid id value',
      });
    }

    try {
      const UserToDelete = await UserService.deleteUser(id);

      if (UserToDelete) {
        Utils.setSuccess(200, 'User deleted');
      } else {
        Utils.setError(404, `User with the id ${id} cannot be found`);
      }
      return Utils.send(res);
    } catch (error) {
      Utils.setError(400, error);
      return Utils.send(res);
    }
  }*/
}

module.exports = UserController;
