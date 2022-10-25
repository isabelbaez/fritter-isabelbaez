import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FreetCredibilityScoreCollection from './collection';
import * as userValidator from '../user/middleware';
import * as scoreValidator from '../freetCredibilityScore/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/freets
 *
 * @return {LikeResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/freets?authorId=id
 *
 * @return {LikeResponse[]} - An array of freets created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.parentId !== undefined) {
      next();
      return;
    }

    const allScores= await FreetCredibilityScoreCollection.findAll();
    const response = allScores.map(util.constructScoreResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {

    const parentScore = await FreetCredibilityScoreCollection.findOneByParent(req.query.parentId as string);
    
    const response = util.constructScoreResponse(parentScore);
    res.status(200).json(response);
  }
);

/**
 * Create a new freet.
 *
 * @name POST /api/likes
 *
 * @param {string} like - The content of the freet
 * @return {LikeResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    scoreValidator.isValidScoreParent
  ],
  async (req: Request, res: Response) => {
    const sourcesString = (req.body.sources as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const sources = sourcesString.split(',');

    const score = await FreetCredibilityScoreCollection.addOne(req.body.parentId,sources);

    res.status(201).json({
      message: 'Your score was created successfully.',
      score: util.constructScoreResponse(score)
    });
  }
);

export {router as freetCredibilityScoreRouter};
