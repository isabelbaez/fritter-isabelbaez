import type {HydratedDocument, Types} from 'mongoose';
import type {Comment} from './model';
import CommentModel from './model';
import UserCollection from '../user/collection';
import LikeCollection from '../like/collection';
import FreetCollection from '../freet/collection';
import { Like } from '../like/model';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class CommentCollection {
  /**
   * Add a comment to the collection
   *
   * @param {string} authorId - The id of the author of the comment
   * @param {string} content - The id of the content of the comment
   * @return {Promise<HydratedDocument<Comment>>} - The newly created comment
   */
  static async addOne(authorId: Types.ObjectId | string, parentId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Comment>> {
    const date = new Date();
    const comment = new CommentModel({
      authorId,
      parentId,
      dateCreated: date,
      content,
    });

    await comment.save(); // Saves freet to MongoDB

    const freet = await FreetCollection.findOne(parentId);
 
    if (freet) {
      FreetCollection.updateComment(parentId,comment._id);
    } else {
      CommentCollection.updateComment(parentId, comment._id);
    }

    const user = await UserCollection.findOneByUserId(authorId);
    await UserCollection.updateComment(user._id, comment._id);

    return comment;
  }

  /**
   * Find a comment by commentId
   *
   * @param {string} commentId - The id of the coment to find
   * @return {Promise<HydratedDocument<Comment>> | Promise<null> } - The coment with the given commentId, if any
   */
  static async findOne(commentId: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {
    return CommentModel.findOne({_id: commentId});
  }

  /**
   * Get all the comments in the database
   *
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the comments
   */
  static async findAll(): Promise<Array<HydratedDocument<Comment>>> {
    // Retrieves commenrs and sorts them from most to least recent
    return CommentModel.find({}).sort({dateCreated: -1});
  }

  /**
   * Get all the comments in by given author
   *
   * @param {string} username - The username of author of the comments
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the comments
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Comment>>> {
    const author = await UserCollection.findOneByUsername(username);
    return CommentModel.find({authorId: author._id});
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} commentId - The id of the freet to be updated
   * @param {Object} likeId - The id of the like to be added
   * @return {Promise<HydratedDocument<Comment>>} - The newly updated comment
   */
  static async updateLike(commentId: Types.ObjectId | string, likeId: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {
    const comment = await CommentModel.findOne({_id: commentId});
    const like = await LikeCollection.findOne(likeId);

    const prev_likes: Array<string> = comment.likes;

    prev_likes.push(likeId.toString());

    comment.likes = prev_likes;

    await comment.save();
    return comment;
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} commentId - The id of the freet to be updated
   * @param {Object} likeId - The id of the like to be added
   * @return {Promise<HydratedDocument<Comment>>} - The newly updated freet
   */
  static async removeLike(commentId: Types.ObjectId | string, likeId: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {
    const comment = await CommentModel.findOne({_id: commentId});

    const prev_likes: Array<string> = comment.likes;
    const new_likes: Array<string> = [];

    for (let like of prev_likes) {
      if (like !== likeId) {
        new_likes.push(like);
      }
    }
    comment.likes = new_likes;

    await comment.save();
    return comment;
  }
  
  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} commentId - The id of the refreet to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
   static async updateComment(parentId: Types.ObjectId | string, commentId: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {
    
    const parent = await CommentModel.findOne({_id: parentId});

    const prevComments: Array<string> = parent.comments;

    prevComments.push(commentId.toString());

    parent.comments = prevComments;

    await parent.save();
    return parent;
  }
  
  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} commentId - The id of the refreet to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async removeComment(parentId: Types.ObjectId | string, commentId: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {

    const parent = await CommentModel.findOne({_id: parentId});

    const prevComments: Array<string> = parent.comments;
    const newComments: Array<string> = [];

    for (let comment of prevComments) {
      if (comment !== commentId) {
        newComments.push(comment);
      }
    }

    parent.comments = newComments;

    await parent.save();
    return parent;
  }

  /**
   * Delete a freet with given freetId.
   *
   * @param {string} commentId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(commentId: Types.ObjectId | string): Promise<boolean> {

    const comment = await CommentCollection.findOne(commentId);

    const freet = await FreetCollection.findOne(comment.parentId);
 
    if (freet) {
      await FreetCollection.removeComment(comment.parentId,commentId);
    } else {
      await CommentCollection.removeComment(comment.parentId,commentId);
    }

    for (let like of comment.likes) {
      await LikeCollection.deleteOne(like);
    }

    for (let reply of comment.comments) {
      await CommentCollection.deleteOne(reply);
    }

    const user = await UserCollection.findOneByUserId(comment.authorId);
    await UserCollection.removeComment(user._id, comment._id);

    const delComment = await CommentModel.deleteOne({_id: commentId});
    return delComment !== null;
  }
}

export default CommentCollection;
