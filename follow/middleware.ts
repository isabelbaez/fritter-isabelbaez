import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import FollowCollection from './collection';

/**
 * Checks if a follow with followId is req.params exists
 */
const isFollowExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.followId);
  const follow = validFormat ? await FollowCollection.findOne(req.params.followId) : '';
  if (!follow) {
    res.status(404).json({
      error: {
        followNotFound: `Follow with follow ID ${req.params.followId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a follow with followId is req.params exists
 */
 const isValidUnfollow = async (req: Request, res: Response, next: NextFunction) => {

  const follow = await FollowCollection.findOne(req.params.followId);
  const dtsUser = follow.dstUserId.toString();

  if (follow.srcUserId.toString() !== req.session.userId.toString()) {
    res.status(403).json({
      error: {
        notValidUnfollow: `User with user ID ${req.session.userId} is not the source user in follow with ID ${req.params.followId}.`
      }
    });
    return;
  }
  next();
};

/**
 * Checks if the new follow is not an existing follow.
 */
const isValidFollow = async (req: Request, res: Response, next: NextFunction) => {

  const user = await UserCollection.findOneByUserId(req.session.userId);

  const following = await FollowCollection.findAllFollowing(user.username);

  let already_following = false;

  for (let follow of following) {
    if (follow.dstUserId.toString() === req.body.dstUserId.toString()) {
      already_following = true;
      break;
    }
  }

  if (already_following) {
    res.status(413).json({
      error: {
        duplicateFollow: `User with user ID ${req.session.userId} is already following User with user ID ${req.body.dstUserId}.`
      }
    });
    return;
  }
  next();
};

export {
  isValidFollow,
  isFollowExists,
  isValidUnfollow
};
