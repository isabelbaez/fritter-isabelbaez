import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import LikeCollection from '../like/collection';

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */

 const isLikeExists = async (req: Request, res: Response, next: NextFunction) => {

  const validFormat = Types.ObjectId.isValid(req.params.parentId);
  const like = validFormat ? await LikeCollection.findOnebyUserFreet(req.session.userId,req.params.parentId) : '';

  if (!like) {
    res.status(404).json({
      error: {
        likeNotFound: `Like with user ID ${req.session.userId} and parent ID ${req.params.parentId} does not exist.`
      }
    });
    return;
  }
  next();
};

const isValidLikeParent = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.body.parentId);
  const freet = validFormat ? await FreetCollection.findOne(req.body.parentId) : '';

  if (!freet) {
    res.status(404).json({
      error: {
        freetNotFound: `Parent freet with freet ID ${req.body.parentId} does not exist.`
      }
    });
    return;
  }

  let exists = false;
  for (let like_id of freet.likes) {
    const like = await LikeCollection.findOne(like_id)
    if (like.userId.toString() == req.session.userId && like.parentId.toString() == req.body.parentId) {
      exists = true;
      break;
    }
  }

  if (exists) {
    res.status(403).json({
      error: {
        doubleLiked: `Parent freet with freet ID ${req.body.parentId} has already been liked by ${req.session.userId}`
      }
    });
   }

  next();
};


export {
  isLikeExists,
  isValidLikeParent,

};
