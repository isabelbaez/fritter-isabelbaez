import type {HydratedDocument, Types} from 'mongoose';
import type {Like} from './model';
import LikeModel from './model';
import UserCollection from '../user/collection';
import FreetModel from 'freet/model';
import FreetCollection from '../freet/collection';
import CommentCollection from '../comment/collection';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class LikeCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} userId - The id of the user liking
   * @param {string} parentId - The id of the freet/comment being liked
   * @return {Promise<HydratedDocument<Like>>} - The newly created freet
   */
  static async addOne(userId: Types.ObjectId | string, parentId: Types.ObjectId | string): Promise<HydratedDocument<Like>> {
    const date = new Date();
    const like = new LikeModel({
      userId,
      parentId,
      dateCreated: date,
    });

    const freet = await FreetCollection.findOne(parentId);
 
    if (freet) {
      FreetCollection.updateLike(parentId, like._id);
    } else {
      CommentCollection.updateLike(parentId, like._id);
    }

    await like.save(); // Saves freet to MongoDB
    return like;
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} likeId - The id of the freet to find
   * @return {Promise<HydratedDocument<Like>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(likeId: Types.ObjectId | string): Promise<HydratedDocument<Like>> {
    return LikeModel.findOne({_id: likeId});
  }

  /**
   * Find a like by userId and parentId
   *
   * @param {string} userId - The user id of the like to find
   * @param {string} parentId - The parent id of the like to find
   * @return {Promise<HydratedDocument<Refreet>> | Promise<null> } - The like with the given user and parent IDs, if any
   */
    static async findOnebyUserFreet(userId: Types.ObjectId | string, parentId: Types.ObjectId | string): Promise<HydratedDocument<Like>> {
    return LikeModel.findOne({userId: userId, parentId: parentId});
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Like>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<Like>>> {
    // Retrieves freets and sorts them from most to least recent
    return LikeModel.find({}).sort({dateCreated: -1});
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Like>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Like>>> {
    const user = await UserCollection.findOneByUsername(username);
    return LikeModel.find({userId: user._id});
  }

  /**
   * Delete a freet with given freetId.freet
   *
   * @param {string} likeId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(likeId: Types.ObjectId | string): Promise<boolean> {
  
    const like = await LikeCollection.findOne(likeId);
    const delLike = await LikeModel.deleteOne({_id: likeId});

    const freet = await FreetCollection.findOne(like.parentId);
 
    if (freet) {
      await FreetCollection.removeLike(like.parentId,likeId);
    } else {
      await CommentCollection.removeLike(like.parentId,likeId);
    }
    
    return delLike !== null;
  }

  /**
   * Delete all the freets by the given author
   *
   * @param {string} userId - The id of author of freets
   */
  static async deleteMany(userId: Types.ObjectId | string): Promise<void> {
    await LikeModel.deleteMany({userId});
  }
}

export default LikeCollection;
