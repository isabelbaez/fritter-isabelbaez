import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import ContestCredibilityCollection from './collection';
import * as userValidator from '../user/middleware';
import * as contestValidator from '../contestCredibility/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/contestCredibility
 *
 * @return {ContestResponse[]} - A list of all the contests
 *              
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

    const allContests= await ContestCredibilityCollection.findAll();
    const response = allContests.map(util.constructContestResponse);
    res.status(200).json(response);
  },
  [
    contestValidator.isValidContestFreet
  ],
  async (req: Request, res: Response) => {

    const parentContests = await ContestCredibilityCollection.findAllByParent(req.query.parentId as string);
    const response = parentContests.map(util.constructContestResponse);
  
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
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    contestValidator.isValidContestFreet,
    contestValidator.isValidContestingUser
  ],
  async (req: Request, res: Response) => {
    const sourcesString = (req.body.sources as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const sources = sourcesString.split(',');

    let contest;

    if (req.body.inFavor) {
      contest = await ContestCredibilityCollection.addOne(req.body.freetId,true,sources);
    } else {
      contest = await ContestCredibilityCollection.addOne(req.body.freetId,false,sources);
    }

    res.status(201).json({
      message: 'Your contest was created successfully.',
      contest: util.constructContestResponse(contest)
    });
  }
);

/**
 * Delete a freet
 *
 * @name DELETE /api/freets/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 */
router.delete(
  '/:contestId?',
  [
    userValidator.isUserLoggedIn,
    contestValidator.isContestExists,
  ],
  async (req: Request, res: Response) => {

    const contestId = (req.params.contestId as string) ?? '';
    
    await ContestCredibilityCollection.deleteOne(contestId);
    res.status(200).json({
      message: 'Your contest was deleted successfully.'
    });
  }
);

export {router as contestCredibilityRouter};
