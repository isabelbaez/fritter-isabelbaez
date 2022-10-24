import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import ContestCredibilityCollection from '../contestCredibility/collection';
import UserCollection from 'user/collection';

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */

 const isContestExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.contestId);
  const score = validFormat ? await ContestCredibilityCollection.findOne(req.params.contestId) : '';

  if (!score) {
    res.status(404).json({
      error: {
        contestNotFound: `Contest with ID ${req.params.scoreId} does not exist.`
      }
    });
    return;
  }
  next();
};

const isValidContestingUser = async (req: Request, res: Response, next: NextFunction) => {
  const freet = await FreetCollection.findOne(req.body.freetId);

  if (freet._id.toString() === req.session.userId.toString()) {
    res.status(403).json({
      error: {
        authorNotAllowed: `Users cannot contest the score of their own Freets.`
      }
    });
    return;
  }
  next();
};

const isValidContestFreet = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.body.freetId);
  const freet = validFormat ? await FreetCollection.findOne(req.body.freetId) : '';

  if (!freet) {
    res.status(404).json({
      error: {
        scoreNotFound: `Freet with ID ${req.body.freetId} does not exist.`
      }
    });
    return;
  }

  const score = freet.credibilityScoreId;
  if (score === undefined) {
    if (!freet) {
      res.status(404).json({
        error: {
          scoreNotFound: `Freet with ID ${req.body.freetId} does not have a credibility score.`
        }
      });
      return;
    }
  }
  next();
};


export {
  isContestExists,
  isValidContestingUser,
  isValidContestFreet,
};
