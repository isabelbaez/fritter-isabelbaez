import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import UserCollection from '../user/collection';
import FeedCollection from './collection';

/**
 * Checks if a freet with freetId is req.params exists
 */
const isFeedExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  const freet = validFormat ? await FreetCollection.findOne(req.params.freetId) : '';
  if (!freet) {
    res.status(404).json({
      error: {
        freetNotFound: `Freet with freet ID ${req.params.freetId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */
const isValidNewFeed = async (req: Request, res: Response, next: NextFunction) => {

  const allFeeds = await FeedCollection.findAll();

  for (let feed of allFeeds) {
    if (feed.viewerId == req.session.userId) {
      res.status(400).json({
        error: 'Each user may only have one feed.'
      });
      return;
    }
  }
  next();
};

export {
  isFeedExists,
  isValidNewFeed,
};
