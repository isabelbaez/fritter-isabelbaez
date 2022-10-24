import type {HydratedDocument, Types} from 'mongoose';
import type {Freet} from './model';
import FreetModel from './model';
import UserCollection from '../user/collection';
import LikeCollection from '../like/collection';
import RefreetCollection from '../refreet/collection';
import CommentCollection from '../comment/collection';
import { Like } from '../like/model';
import CommentModel from 'comment/model';
import FreetCredibilityScoreCollection from '../freetCredibilityScore/collection';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FreetCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} authorId - The id of the author of the freet
   * @param {string} content - The id of the content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly created freet
   */
  static async addOne(authorId: Types.ObjectId | string, content: string, sources?: Array<string>): Promise<HydratedDocument<Freet>> {
    const date = new Date();
    let freet = new FreetModel({
      authorId,
      dateCreated: date,
      content,
      dateModified: date
    });

    await freet.save(); // Saves freet to MongoDB

    if (sources) {
      const score = await FreetCredibilityScoreCollection.addOne(freet._id, sources);
      freet = await FreetCollection.updateScore(freet._id, score._id);
    }

    const user = await UserCollection.findOneByUserId(authorId);
    await UserCollection.updateFreet(user._id, freet._id);

    return freet;
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} freetId - The id of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    return FreetModel.findOne({_id: freetId});
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<Freet>>> {
    // Retrieves freets and sorts them from most to least recent
    return FreetModel.find({}).sort({dateModified: -1});
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const author = await UserCollection.findOneByUsername(username);
    return FreetModel.find({authorId: author._id});
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} scoreId - The id of the score to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
   static async updateScore(freetId: Types.ObjectId | string, scoreId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    const score = await FreetCredibilityScoreCollection.findOne(scoreId);

    freet.credibilityScoreId = score._id;

    await freet.save();
    return freet;
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} likeId - The id of the like to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateLike(freetId: Types.ObjectId | string, likeId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    const like = await LikeCollection.findOne(likeId);

    const prev_likes: Array<string> = freet.likes;

    prev_likes.push(likeId.toString());

    freet.likes = prev_likes;

    await freet.save();
    return freet;
  }

    /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} likeId - The id of the like to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
    static async removeLike(freetId: Types.ObjectId | string, likeId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});

    const prev_likes: Array<string> = freet.likes;
    const new_likes: Array<string> = [];

    for (let like of prev_likes) {
      if (like !== likeId) {
        new_likes.push(like);
      }
    }
    freet.likes = new_likes;

    await freet.save();
    return freet;
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} refreetId - The id of the refreet to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
    static async updateRefreet(freetId: Types.ObjectId | string, refreetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    const refreet = await RefreetCollection.findOne(refreetId);

    const prev_refreets: Array<string> = freet.refreets;

    prev_refreets.push(refreetId.toString());

    freet.refreets = prev_refreets;

    await freet.save();
    return freet;
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} refreetId - The id of the refreet to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
    static async removeRefreet(freetId: Types.ObjectId | string, refreetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});

    const prev_refreets: Array<string> = freet.refreets;
    const new_refreets: Array<string> = [];

    for (let refreet of prev_refreets) {
      if (refreet !== refreetId) {
        new_refreets.push(refreet);
      }
    }

    freet.refreets = new_refreets;

    await freet.save();
    return freet;
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} refreetId - The id of the refreet to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateComment(freetId: Types.ObjectId | string, commentId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    const comment = await CommentCollection.findOne(commentId);

    const prevComments: Array<string> = freet.comments;

    prevComments.push(commentId.toString());

    freet.comments = prevComments;

    await freet.save();
    return freet;
  }
  
  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {Object} refreetId - The id of the refreet to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async removeComment(freetId: Types.ObjectId | string, commentId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});

    const prevComments: Array<string> = freet.comments;
    const newComments: Array<string> = [];

    for (let comment of prevComments) {
      if (comment !== commentId) {
        newComments.push(comment);
      }
    }

    freet.comments = newComments;

    await freet.save();
    return freet;
  }
  
  /**
   * Delete a freet with given freetId.
   *
   * @param {string} freetId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(freetId: Types.ObjectId | string): Promise<boolean> {

    const freet = await FreetModel.findOne({_id: freetId});

    for (let comment of freet.comments) {
      await CommentCollection.deleteOne(comment);
    }

    for (let like of freet.likes) {
      await LikeCollection.deleteOne(like);
    }

    for (let refreet of freet.refreets) {
      await RefreetCollection.deleteOne(refreet);
    }

    const user = await UserCollection.findOneByUserId(freet.authorId);
    await UserCollection.removeFreet(user._id, freet._id);

    if (freet.credibilityScoreId !== undefined) {
      await FreetCredibilityScoreCollection.deleteOne(freet.credibilityScoreId);
    }

    const delFreet = await FreetModel.deleteOne({_id: freetId});

    return delFreet !== null;
  }
}

export default FreetCollection;
