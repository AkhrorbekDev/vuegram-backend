const PostModel = require('../models/post');
const UserService = require('../services/UserService');

class PostService {
  static posts;
  static post;
  static user;

  static async getPosts({ query = null }) {
    try {
      let posts;
      if (query !== null) {
        posts = await PostModel.findAll({
          where: query,
          order: [
            ['date', 'DESC'],
          ],
        });
        if (posts.length === 0) {
          return [];
        }
      } else {
        posts = await PostModel.findAll();
      }
      if (posts.length > 0) {
        this.posts = await Promise.all(posts.map(async (post) => {
          this.user = await UserService.getUser(query = {
            id: post.user,
          });
          post.user = {
            id: this.user.id,
            login: this.user.login,
          };
          return post;
        }));
      } else {
        this.posts = [];
      }
      return this.posts;
    } catch (error) {
      throw error;
    }
  }


  static async createPost(data) {
    try {
      return await PostModel.create(data);
    } catch (error) {
      throw error;
    }
  }

  static async deletePost(id) {
    try {
      const PostToDelete = await PostModel.findOne({
        where: {
          id: id,
        },
      });
      if (PostToDelete) {
        return await PostModel.destroy({
          where: {
            id: id,
          },
        });
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = PostService;