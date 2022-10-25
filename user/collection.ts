import FeedCollection from '../feed/collection';
import type {HydratedDocument, Types} from 'mongoose';
import type {User} from './model';
import UserModel from './model';
import { Freet } from 'freet/model';
import FreetCollection from '../freet/collection';
import SearchCollection from '../search/collection';
import LikeCollection from '../like/collection';
import RefreetCollection from '../refreet/collection';
import FreetCredibilityScoreCollection from '../freetCredibilityScore/collection';
import CommentCollection from '../comment/collection';
import FollowCollection from '../follow/collection';

/**
 * This file contains a class with functionality to interact with users stored
 * in MongoDB, including adding, finding, updating, and deleting. Feel free to add
 * additional operations in this file.
 *
 * Note: HydratedDocument<User> is the output of the UserModel() constructor,
 * and contains all the information in User. https://mongoosejs.com/docs/typescript.html
 */
class UserCollection {
  /**
   * Add a new user
   *
   * @param {string} username - The username of the user
   * @param {string} password - The password of the user
   * @return {Promise<HydratedDocument<User>>} - The newly created user
   */
  static async addOne(username: string, password: string): Promise<HydratedDocument<User>> {
    const dateJoined = new Date();

    const user = new UserModel({username, password, dateJoined});
    await user.save(); // Saves user to MongoDB

    await FeedCollection.addOne(user._id);
    await SearchCollection.addOne(user._id);

    return user;
  }

  /**
   * Find a user by userId.
   *
   * @param {string} userId - The userId of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUserId(userId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({_id: userId});
  }

  /**
   * Find a user by username (case insensitive).
   *
   * @param {string} username - The username of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUsername(username: string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({username: new RegExp(`^${username.trim()}$`, 'i')});
  }

  /**
   * Find a user by username (case insensitive).
   *
   * @param {string} username - The username of the user to find
   * @param {string} password - The password of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUsernameAndPassword(username: string, password: string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({
      username: new RegExp(`^${username.trim()}$`, 'i'),
      password
    });
  }

  /**
   * Get all the users in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the users
   */
  static async findAll(): Promise<Array<HydratedDocument<User>>> {
    // Retrieves freets and sorts them from most to least recent
    return UserModel.find({}).sort({dateJoined: -1});
  }

  /**
   * Update user's information
   *
   * @param {string} userId - The userId of the user to update
   * @param {Object} userDetails - An object with the user's updated credentials
   * @return {Promise<HydratedDocument<User>>} - The updated user
   */
  static async updateOne(userId: Types.ObjectId | string, userDetails: any): Promise<HydratedDocument<User>> {
    const user = await UserModel.findOne({_id: userId});
    if (userDetails.password) {
      user.password = userDetails.password as string;
    }

    if (userDetails.username) {
      user.username = userDetails.username as string;
    }

    if (userDetails.enable) {
      await UserCollection.enableUserCredibilityScore(userId);
    }

    if (userDetails.disable) {
      await UserCollection.disableUserCredibilityScore(userId);
    }

    await user.save();
    return user;
  }

  /**
   * Enable a user's credibility score
   *
   * @param {string} userId - The userId of the user to update
   * @return {Promise<HydratedDocument<User>>} - The updated user
   */
  static async enableUserCredibilityScore(userId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    const user = await UserModel.findOne({_id: userId});

    const userFreets = await FreetCollection.findAllByUsername(user.username);
    let totalFreetScore = 0.0;
    let totalScoredFreets = 0;

    for (const freet of userFreets) {
      if (freet.authorId.toString() === user._id.toString() && (freet.credibilityScoreId !== undefined)) {
        const score = await FreetCredibilityScoreCollection.findOne(freet.credibilityScoreId);
        totalFreetScore += score.value;
        totalScoredFreets += 1;
      }
    }

    if (totalScoredFreets == 0) {
      user.credibilityScore = "Disabled";
    } else {
      user.credibilityScore = totalFreetScore/totalScoredFreets;
    }

    await user.save();
    return user;
  }

  /**
   * Disable a user's credibility score
   *
   * @param {string} userId - The userId of the user to update
   * @return {Promise<HydratedDocument<User>>} - The updated user
   */
  static async disableUserCredibilityScore(userId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    const user = await UserModel.findOne({_id: userId});
    user.credibilityScore = "Disabled";

    await user.save();
    return user;
  }
  
  
  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} freetId - The id of the freet to be added
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
   static async updateFreet(userId: Types.ObjectId | string, freetId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});
    const freets: Array<string> = user.freets;

    if (!(freets.includes(freetId.toString()))) {
      freets.push(freetId.toString());
    }

    user.freets = freets;

    await user.save();
    return user;
  }

  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} freetId - The id of the freet to be removed
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async removeFreet(userId: Types.ObjectId | string, freetId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});

    const prev_freets: Array<string> = user.freets;
    const new_freets: Array<string> = [];

    for (let freet of prev_freets) {
      if (freet !== freetId) {
        new_freets.push(freet);
      }
    }

    user.freets = new_freets;

    await user.save();
    return user;
  }

  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} likeId - The id of the like to be added
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async updateLike(userId: Types.ObjectId | string, likeId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});
    const likes: Array<string> = user.likes;

    likes.push(likeId.toString());

    user.likes = likes;

    await user.save();
    return user;
  }
  
  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} likeId - The id of the like to be removed
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async removeLike(userId: Types.ObjectId | string, likeId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});

    const prev_likes: Array<string> = user.likes;
    const new_likes: Array<string> = [];

    for (let like of prev_likes) {
      if (like !== likeId) {
        new_likes.push(like);
      }
    }

    user.likes = new_likes;

    await user.save();
    return user;
  }

  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} commentId - The id of the comment to be added
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async updateComment(userId: Types.ObjectId | string, commentId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});
    const comments: Array<string> = user.comments;

    comments.push(commentId.toString());

    user.comments = comments;

    await user.save();
    return user;
  }
    
  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} commentId - The id of the comment to be removed
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async removeComment(userId: Types.ObjectId | string, commentId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});

    const prev_comments: Array<string> = user.comments;
    const new_comments: Array<string> = [];

    for (let comment of prev_comments) {
      if (comment !== commentId) {
        new_comments.push(comment);
      }
    }

    user.comments = new_comments;

    await user.save();
    return user;
  }

  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} followerId - The id of the follower to be added
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async updateFollower(userId: Types.ObjectId | string, followerId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});
    const followers: Array<string> = user.followers;

    followers.push(followerId.toString());

    user.followers = followers;

    await user.save();
    return user;
  }

  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} followerId - The id of the follower to be removed
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async removeFollower(userId: Types.ObjectId | string, followerId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});

    const prev_followers: Array<string> = user.followers;
    const new_followers: Array<string> = [];

    for (let follower of prev_followers) {
      if (follower !== followerId) {
        new_followers.push(follower);
      }
    }

    user.followers = new_followers;

    await user.save();
    return user;
  }

  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} followingId - The id of the followed user to be added
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async updateFollowing(userId: Types.ObjectId | string, followingId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});
    const following: Array<string> = user.following;

    following.push(followingId.toString());

    user.following = following;

    await user.save();
    return user;
  }

  /**
   * Update a user with the new content
   *
   * @param {string} userId - The id of the user to be updated
   * @param {Object} followingId - The id of the ollowed user to be removed
   * @return {Promise<HydratedDocument<User>>} - The newly updated user
   */
  static async removeFollowing(userId: Types.ObjectId | string, followingId: Types.ObjectId | string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: userId});

    const prev_following: Array<string> = user.following;
    const new_following: Array<string> = [];

    for (let following of prev_following) {
      if (following !== followingId) {
        new_following.push(following);
      }
    }

    user.following = new_following;

    await user.save();
    return user;
  }

  /**
   * Delete a user from the collection.
   *
   * @param {string} userId - The userId of user to delete
   * @return {Promise<Boolean>} - true if the user has been deleted, false otherwise
   */
  static async deleteOne(userId: Types.ObjectId | string): Promise<boolean> {
    const user = await UserModel.findById({_id: userId});
    
    const userFeed = await FeedCollection.findOneByUser(userId);
    await FeedCollection.deleteOne(userFeed._id); 

    const userSearch = await SearchCollection.findOneByUser(userId);
    await SearchCollection.deleteOne(userSearch._id); 

    const freets = await FreetCollection.findAllByUsername(user.username);

    for (const follow of user.followers) {
      await FollowCollection.deleteOne(follow);
    }

    for (const follow of user.following) {
      await FollowCollection.deleteOne(follow);
    }

    for (const like of user.likes) {
      await LikeCollection.deleteOne(like);
    }

    for (const comment of user.comments) {
      await CommentCollection.deleteOne(comment);
    }

    const refreets = await RefreetCollection.findAllByUsername(user.username);
    
    for (const refreet of refreets) {
      await RefreetCollection.deleteOne(refreet._id);
    }

    for (const freet of freets) {
      await FreetCollection.deleteOne(freet._id);
    }

    const delUser = await UserModel.deleteOne({_id: userId});
    return delUser !== null;
  }
}

export default UserCollection;
