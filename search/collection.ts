import type {HydratedDocument, Types} from 'mongoose';
import type {Search} from './model';
import SearchModel from './model';
import UserCollection from '../user/collection';
import LikeCollection from '../like/collection';
import RefreetCollection from '../refreet/collection';
import CommentCollection from '../comment/collection';
import { Freet } from '../freet/model';
import CommentModel from 'comment/model';
import FollowCollection from '../follow/collection';
import FreetCollection from '../freet/collection';
import { isUserLoggedIn } from 'user/middleware';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class SearchCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} viewerId - The id of the author of the freet
   * @return {Promise<HydratedDocument<Search>>} - The newly created freet
   */
  static async addOne(viewerId: Types.ObjectId | string): Promise<HydratedDocument<Search>> {
    
    const search = new SearchModel({
      viewerId,
    });

    await search.save(); // Saves freet to MongoDB
    return search;
  }

  /**
   * Find a search by searchId
   *
   * @param {string} searchId - The id of the search to find
   * @return {Promise<HydratedDocument<Search>> | Promise<null> } - The search with the given searchId, if any
   */
  static async findOne(searchId: Types.ObjectId | string): Promise<HydratedDocument<Search>> {
    return SearchModel.findOne({_id: searchId});
  }

  /**
   * Find a search by userId
   *
   * @param {string} userId - The id of the user of the search to find
   * @return {Promise<HydratedDocument<Search>> | Promise<null> } - The search with the given userId, if any
   */
  static async findOneByUser(userId: Types.ObjectId | string): Promise<HydratedDocument<Search>> {
    return SearchModel.findOne({viewerId: userId});
  }

  /**
   * Delete a search with given searchId.
   *
   * @param {string} searchId - The searchId of search to delete
   * @return {Promise<Boolean>} - true if the search has been deleted, false otherwise
   */
  static async deleteOne(searchId: Types.ObjectId | string): Promise<boolean> {
    const delSearch = await SearchModel.deleteOne({_id: searchId});
    return delSearch !== null;
  }

  /**
   * Updates an existing search
   *
   * @param {string} searchId - The id of the search
   * @return {Promise<HydratedDocument<Search>>} - The updated search
   */
  static async updateSearch(searchId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Search>> {

    const search = await SearchModel.findOne({_id: searchId});
    const viewer = await UserCollection.findOneByUserId(search.viewerId);
    let users: Array<string> = [];

    for (let followId of viewer.following) {
      const follow = await FollowCollection.findOne(followId);
      const user = await UserCollection.findOneByUserId(follow.dstUserId);

      if (user.username.includes(content)) {
        users.push(user._id.toString());
      }
    }

    const allUsers = await UserCollection.findAll();

    for (const user of allUsers) {
      if (!users.includes(user._id.toString()) && user.username.includes(content)) {
        users.push(user._id.toString());
      }
    }

    if (content.length == 0) {
      users = [];
    }

    search.users = users;

    await search.save(); // Saves freet to MongoDB
    return search;
  }
}

export default SearchCollection;
