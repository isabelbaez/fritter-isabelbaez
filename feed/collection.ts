import type {HydratedDocument, Types} from 'mongoose';
import type {Feed} from './model';
import FeedModel from './model';
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
class FeedCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} viewerId - The id of the author of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly created freet
   */
  static async addOne(viewerId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    let viewerFreetIds: Array<string> = [];
    
    const feed = new FeedModel({
      viewerId,
      viewerFreetIds,
    });

    await feed.save(); // Saves freet to MongoDB

    await FeedCollection.updateFeed(feed._id);

    return feed;
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} feedId - The id of the freet to find
   * @return {Promise<HydratedDocument<Feed>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(feedId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    return FeedModel.findOne({_id: feedId});
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} userId - The id of the freet to find
   * @return {Promise<HydratedDocument<Feed>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOneByUser(userId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    return FeedModel.findOne({viewerId: userId});
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Feed>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<Feed>>> {
    // Retrieves freets and sorts them from most to least recent
    return FeedModel.find({}).sort({dateModified: -1});
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Feed>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Feed>>> {
    const user = await UserCollection.findOneByUsername(username);
    return FeedModel.find({viewerId: user._id});
  }


  /**
   * Delete a freet with given freetId.
   *
   * @param {string} feedId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(feedId: Types.ObjectId | string): Promise<boolean> {
    const delFreet = await FeedModel.deleteOne({_id: feedId});
    return delFreet !== null;
  }

  /**
   * Add a freet to the collection
   *
   * @param {string} viewerId - The id of the author of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly created freet
   */
  static async updateFeed(feedId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {

    const feed = await FeedModel.findOne({_id: feedId});

    const viewer = await UserCollection.findOneByUserId(feed.viewerId);
    const viewerFollowing = await FollowCollection.findAllFollowing(viewer.username);

    let viewerFreetIds: Array<string> = [];

    for (let follow of viewerFollowing) {

      const user = await UserCollection.findOneByUserId(follow.dstUserId);

      const freets = await FreetCollection.findAllByUsername(user.username);
      const refreets = await RefreetCollection.findAllByUsername(user.username);
      const comments = await CommentCollection.findAllByUsername(user.username);

      for (let freet of freets) {
        viewerFreetIds.push(freet._id.toString());
      }

      for (let refreet of refreets) {
        viewerFreetIds.push(refreet.parentId.toString());
      }

      for (let comment of comments) {
        viewerFreetIds.push(comment.parentId.toString());
      }
    }

    const allFreets = await FreetCollection.findAll();

    let content: Array<string> = [];

    for (let freet of allFreets) {
      if (viewerFreetIds.includes(freet._id.toString())) {
        content.push(freet._id.toString());
      }
    }

    feed.freets = content;

    await feed.save(); // Saves freet to MongoDB
    return feed;
  }
}

export default FeedCollection;
