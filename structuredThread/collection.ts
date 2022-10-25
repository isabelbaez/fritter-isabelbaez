import type {HydratedDocument, Types} from 'mongoose';
import type {StructuredThread} from './model';
import FreetModel from './model';
import UserCollection from '../user/collection';
import LikeCollection from '../like/collection';
import RefreetCollection from '../refreet/collection';
import CommentCollection from '../comment/collection';
import { Like } from '../like/model';
import CommentModel from 'comment/model';
import FreetCredibilityScoreCollection from '../freetCredibilityScore/collection';
import FreetCollection from '../freet/collection';
import StructuredThreadModel from './model';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class StructuredThreadCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} authorId - The id of the author of the freet
   * @param {string} content - The id of the content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly created freet
   */
  static async addOne(authorId: Types.ObjectId | string, content: Array<string>): Promise<HydratedDocument<StructuredThread>> {

    const freets: Array<string> = [];

    for (const freetContent of content) {
      const threadFreet = await FreetCollection.addOne(authorId,freetContent);
      freets.push(threadFreet._id.toString());
    }

    const date = new Date();
    let thread = new StructuredThreadModel({
      authorId,
      dateCreated: date,
    });

    for (const freetId of freets) {
      const threadFreet = await FreetCollection.findOne(freetId);
      threadFreet.threadId = thread._id;
      await threadFreet.save();
    }

    thread.content = freets;

    await thread.save(); // Saves freet to MongoDB
    return thread;
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} threadId - The id of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(threadId: Types.ObjectId | string): Promise<HydratedDocument<StructuredThread>> {
    return StructuredThreadModel.findOne({_id: threadId});
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<StructuredThread>>> {
    // Retrieves freets and sorts them from most to least recent
    return StructuredThreadModel.find({}).sort({dateModified: -1});
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<StructuredThread>>> {
    const author = await UserCollection.findOneByUsername(username);
    return StructuredThreadModel.find({authorId: author._id});
  }

  /**
   * Delete a freet with given freetId.
   *
   * @param {string} threadId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(threadId: Types.ObjectId | string): Promise<boolean> {

    const delThread = await StructuredThreadModel.deleteOne({_id: threadId});

    return delThread !== null;
  }
}

export default StructuredThreadCollection;
