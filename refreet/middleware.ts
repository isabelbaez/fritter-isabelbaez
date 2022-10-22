import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import RefreetCollection from '../refreet/collection';

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */

 const isRefreetExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.refreetId);
  const refreet = validFormat ? await RefreetCollection.findOne(req.params.refreetId) : '';

  if (!refreet) {
    res.status(404).json({
      error: {
        refreetNotFound: `Refreet with refreet ID ${req.params.refreetId} does not exist.`
      }
    });
    return;
  }

  next();
};

const isValidRefreetParent = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.body.parentId);
  const freet = validFormat ? await FreetCollection.findOne(req.body.parentId) : '';

  if (!freet) {
    res.status(404).json({
      error: {
        freetNotFound: `Parent refreet with refreet ID ${req.body.parentId} does not exist.`
      }
    });
    return;
  }

  let exists = false;
  for (let refreet_id of freet.refreets) {
    const refreet = await RefreetCollection.findOne(refreet_id)
    if (refreet.userId.toString() == req.session.userId && refreet.parentId.toString() == req.body.parentId) {
      exists = true;
      break;
    }
  }

  if (exists) {
    res.status(403).json({
      error: {
        doubleRefreeted: `Parent freet with freet ID ${req.body.parentId} has already been refreeted by ${req.session.userId}`
      }
    });
   }

  next();
};


export {
  isRefreetExists,
  isValidRefreetParent,

};