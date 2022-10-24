import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import SearchCollection from '../search/collection';

/**
 * Checks if a search with searchId is req.params exists
 */
const isSearchExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.searchId);
  const search = validFormat ? await SearchCollection.findOne(req.params.searchId) : '';
  if (!search) {
    res.status(404).json({
      error: {
        searchNotFound: `Search with search ID ${req.params.searchId} does not exist.`
      }
    });
    return;
  }

  next();
};

export {
  isSearchExists,
};
