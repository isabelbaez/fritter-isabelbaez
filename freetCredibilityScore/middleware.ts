import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import FreetCredibilityScoreCollection from '../freetCredibilityScore/collection';

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */

 const isScoreExists = async (req: Request, res: Response, next: NextFunction) => {

  const validFormat = Types.ObjectId.isValid(req.params.parentId);
  const score = validFormat ? await FreetCredibilityScoreCollection.findOneByParent(req.params.parentId) : '';

  if (!score) {
    res.status(404).json({
      error: {
        scoreNotFound: `Score with for freet with ID ${req.params.parentId} does not exist.`
      }
    });
    return;
  }
  next();
};

const isValidScoreParent = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.body.parentId);
  const freet = validFormat ? await FreetCollection.findOne(req.body.parentId) : '';

  if (!freet) {
    res.status(404).json({
      error: {
        freetNotFound: `Parent freet/comment with ID ${req.body.parentId} does not exist.`
      }
    });
    return;
  }
  next();
};


export {
  isScoreExists,
  isValidScoreParent,
};
