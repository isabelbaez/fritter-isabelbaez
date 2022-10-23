import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import CommentCollection from '../comment/collection';
import FreetCollection from '../freet/collection';

/**
 * Checks if a freet with freetId is req.params exists
 */
const isCommentExists = async (req: Request, res: Response, next: NextFunction) => {

  const validFormat = Types.ObjectId.isValid(req.params.commentId);
  const comment = validFormat ? await CommentCollection.findOne(req.params.commentId) : '';

  if (!comment) {
    res.status(404).json({
      error: {
        commenttNotFound: `Comment with comment ID ${req.params.commentId} does not exist.`
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
const isValidCommentContent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.content) {
    next();
    return;
  }

  const {content} = req.body as {content: string};

  if (!content.trim()) {
    res.status(400).json({
      error: 'Comment content must be at least one character long.'
    });
    return;
  }

  if (content.length > 140) {
    res.status(413).json({
      error: 'Comment content must be no more than 140 characters.'
    });
    return;
  }

  next();
};

const isValidCommentParent = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.body.parentId);
  const freet = validFormat ? await FreetCollection.findOne(req.body.parentId) : '';
  const comment = validFormat ? await CommentCollection.findOne(req.body.parentId) : '';

  if (!freet && !comment) {
    res.status(404).json({
      error: {
        freetNotFound: `Parent freet/comment with ID ${req.body.parentId} does not exist.`
      }
    });
    return;
  }
  next();
};

/**
 * Checks if the current user is the author of the freet whose freetId is in req.params
 */
const isValidCommentModifier = async (req: Request, res: Response, next: NextFunction) => {

  const comment = await CommentCollection.findOne(req.params.commentId);
  const userId = comment.authorId;

  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' freets.'
    });
    return;
  }

  next();
};

export {
  isValidCommentContent,
  isCommentExists,
  isValidCommentModifier,
  isValidCommentParent
};
