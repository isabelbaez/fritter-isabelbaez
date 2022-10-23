import type {HydratedDocument, Types} from 'mongoose';
import type {Refreet} from './model';
import RefreetModel from './model';
import UserCollection from '../user/collection';
import FreetModel from 'freet/model';
import FreetCollection from '../freet/collection';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class RefreetCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} userId - The id of the user refreeting
   * @param {string} parentId - The id of the freet/comment being refreeted
   * @return {Promise<HydratedDocument<Refreet>>} - The newly created refreet
   */
  static async addOne(userId: Types.ObjectId | string, parentId: Types.ObjectId | string): Promise<HydratedDocument<Refreet>> {
    const date = new Date();
    const refreet = new RefreetModel({
      userId,
      parentId,
      dateCreated: date,
    });

    FreetCollection.updateRefreet(parentId, refreet._id);

    await refreet.save(); // Saves freet to MongoDB
    return refreet;
  }

  /**
   * Find a refreet by refreet
   *
   * @param {string} refreetId - The id of the refreet to find
   * @return {Promise<HydratedDocument<Refreet>> | Promise<null> } - The refreet with the given refreet, if any
   */
  static async findOne(refreetId: Types.ObjectId | string): Promise<HydratedDocument<Refreet>> {
    return RefreetModel.findOne({_id: refreetId});
  }

  /**
   * Find a refreet by refreet
   *
   * @param {string} userId - The user id of the refreet to find
   * @param {string} parentId - The parent id of the refreet to find
   * @return {Promise<HydratedDocument<Refreet>> | Promise<null> } - The refreet with the given refreet, if any
   */
    static async findOnebyUserFreet(userId: Types.ObjectId | string, parentId: Types.ObjectId | string): Promise<HydratedDocument<Refreet>> {
    return RefreetModel.findOne({userId: userId, parentId: parentId});
  }

  /**
   * Get all the refreets in the database
   *
   * @return {Promise<HydratedDocument<Refreet>[]>} - An array of all of the refreets
   */
  static async findAll(): Promise<Array<HydratedDocument<Refreet>>> {
    // Retrieves refreets and sorts them from most to least recent
    return RefreetModel.find({}).sort({dateCreated: -1});
  }

  /**
   * Get all the refreets in by given author
   *
   * @param {string} username - The username of author of the refreets
   * @return {Promise<HydratedDocument<Refreet>[]>} - An array of all of the refreets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Refreet>>> {
    const user = await UserCollection.findOneByUsername(username);
    return RefreetModel.find({userId: user._id});
  }

  /**
   * Delete a refreet with given refreetId.freet
   *
   * @param {string} refreetId - The refreetId of refreet to delete
   * @return {Promise<Boolean>} - true if the refreet has been deleted, false otherwise
   */
  static async deleteOne(refreetId: Types.ObjectId | string): Promise<boolean> {

    const refreet = await RefreetCollection.findOne(refreetId);
    const delRefreet = await RefreetModel.deleteOne({_id: refreetId});
    
    FreetCollection.removeRefreet(refreet.parentId,refreetId);

    return delRefreet !== null;
  }

  /**
   * Delete all the refreets by the given author
   *
   * @param {string} userId - The id of author of refreets
   */
  static async deleteMany(userId: Types.ObjectId | string): Promise<void> {
    await RefreetModel.deleteMany({userId});
  }
}

export default RefreetCollection;
