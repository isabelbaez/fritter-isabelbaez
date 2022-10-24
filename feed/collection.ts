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
import CredibilityFilteringCollection from '../credibilityFiltering/collection';
import FreetCredibilityScoreCollection from '../freetCredibilityScore/collection';

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

    const standInID = 0;

    const feed = new FeedModel({
      viewerId,
      standInID,
      viewerFreetIds,
    });

    const filter = await CredibilityFilteringCollection.addOne(feed._id);

    feed.filterId = filter._id;

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

    const feed = await FeedModel.findOne({_id: feedId});
    const filterId = feed.filterId;

    await CredibilityFilteringCollection.deleteOne(filterId);

    const delFeed = await FeedModel.deleteOne({_id: feedId});
    return delFeed !== null;
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

    const filter = await CredibilityFilteringCollection.findOne(feed.filterId);

    let unfilteredFreetIds: Array<string> = [];
    const viewerFreetIds: Array<string> = [];

    for (let follow of viewerFollowing) {

      const user = await UserCollection.findOneByUserId(follow.dstUserId);

      const freets = await FreetCollection.findAllByUsername(user.username);
      const refreets = await RefreetCollection.findAllByUsername(user.username);
      const comments = await CommentCollection.findAllByUsername(user.username);

      for (let freet of freets) {
        unfilteredFreetIds.push(freet._id.toString());
      }

      for (let refreet of refreets) {
        unfilteredFreetIds.push(refreet.parentId.toString());
      }

      for (let comment of comments) {
        unfilteredFreetIds.push(comment.parentId.toString());
      }
    }

    for (const freetId of unfilteredFreetIds) {
      const unfilteredFreet = await FreetCollection.findOne(freetId);

      const credScoreId = unfilteredFreet.credibilityScoreId;

      if (!credScoreId) {
        if (filter.unscoredFreets) {
          viewerFreetIds.push(freetId);
        }
      } else {
        const credScore = await FreetCredibilityScoreCollection.findOne(credScoreId);
        if (credScore.value < 3.5) {
          if (filter.lowScoredFreets) {  viewerFreetIds.push(freetId); }
        } else if (credScore.value >= 3.5) {
          if (filter.highScoredFreets) { viewerFreetIds.push(freetId); }
        }
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
