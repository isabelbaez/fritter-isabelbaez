import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import LikeCollection from '../like/collection';

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */

 const isLikeExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.likeId);
  const like = validFormat ? await LikeCollection.findOne(req.params.likeId) : '';

  if (!like) {
    res.status(404).json({
      error: {
        likeNotFound: `Like with like ID ${req.params.likeId} does not exist.`
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

  // TODO (When Freet implementation is complete):
  // if (req.params.userId  in freet.likes) {
  //   res.status(403).json({
  //     error: {
  //       doubleLiked: `Parent freet with freet ID ${req.body.parentId} has already been liked by ${req.params.userId}`
  //     }
  //   });
  //  }

  next();
};


export {
  isLikeExists,
  isValidLikeParent,

};
