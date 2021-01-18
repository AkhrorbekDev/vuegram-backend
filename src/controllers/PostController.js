const PostService = require('../services/PostService');

const fs = require('fs');
const os = require('os');
const path = require('path');
const UUID = require('uuid-v4');
const Busboy = require('busboy');
const admin = require('firebase-admin');

const bucket = admin.storage().bucket();


class PostController {

  static async getPosts(req, res) {
    const { query } = req;
    try {
      const posts = await PostService.getPosts({ query: query });
      if (posts.length > 0) {
        return res.status(200).json({
          status: 200,
          data: posts,
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: 'Posts not found',
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async createPost(req, res) {
    try {
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

              const data = await PostService.createPost(fields);
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
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err,
      });
    }
  }

  static async deletePost(req, res) {
    const { id } = req.params;

    if (!Number(id)) {
      return res.status(401).json({
        status: 401,
        message: 'Please input a valid id value',
      });
    }

    try {
      const DeletedUser = await PostService.deletePost(id);
      if (!DeletedUser) {
        return res.status(200).json({
          status: 200,
          message: `Post by id: ${id} deleted`,
        });
      } else {
        return res.status(404).json({
          status: 200,
          message: `Post by id: ${id} not found`,
        });
      }
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: error,
      });
    }
  }

  /*  static async getPost(req, res) {
    const body = req.body;
    try {
      const post = await PostService.getPost(body);

      if (!post) {
        return res.status(404).json({
          status: 404,
          message: `Post not found`,
        });
      } else {
        return res.status(200).json({
          status: 200,
          data: post,
        });
      }
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: error,
      });
    }
  }*/


}

module.exports = PostController;