import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import StructuredThreadCollection from './collection';

/**
 * Checks if a freet with freetId is req.params exists
 */
const isThreadExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.threadId);
  const thread = validFormat ? await StructuredThreadCollection.findOne(req.params.threadId) : '';
  if (!thread) {
    res.status(404).json({
      error: {
        threadNotFound: `Thread with thread ID ${req.params.freetId} does not exist.`
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
const isValidThreadFreetsContent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.content) {
    next();
    return;
  }

  const content = [req.body.content1, req.body.content2, req.body.content3];

  for (const text of content) {
    if (!text.trim()) {
      res.status(400).json({
        error: 'Freet content must be at least one character long.'
      });
      return;
    }
  
    if (text.length > 140) {
      res.status(413).json({
        error: 'Freet content must be no more than 140 characters.'
      });
      return;
    }
  }
  next();
};

export {
  isValidThreadFreetsContent,
  isThreadExists,
};
