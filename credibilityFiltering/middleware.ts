import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FeedCollection from '../feed/collection';
import CredibilityFilteringCollection from '../credibilityFiltering/collection';

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */

 const isFilterExists = async (req: Request, res: Response, next: NextFunction) => {

  const validFormat = Types.ObjectId.isValid(req.params.filterId);
  const filter = validFormat ? await CredibilityFilteringCollection.findOne(req.params.filterId) : '';

  if (!filter) {
    res.status(404).json({
      error: {
        filterNotFound: `Filter with ID ${req.params.filterId} does not exist.`
      }
    });
    return;
  }
  next();
};

const isValidFilterFeed = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.body.feedId);
  const feed = validFormat ? await FeedCollection.findOne(req.body.feedId) : '';

  if (!feed) {
    res.status(404).json({
      error: {
        feedNotFound: `Parent feed with ID ${req.body.feedId} does not exist.`
      }
    });
    return;
  }
  next();
};


export {
  isFilterExists,
  isValidFilterFeed,
};
