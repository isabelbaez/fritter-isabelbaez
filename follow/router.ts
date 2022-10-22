import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import * as userValidator from '../user/middleware';
import * as followValidator from '../follow/middleware';
import * as util from './util';
import FollowCollection from './collection';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/follows
 *
 * @return {FollowResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/follows?authorId=id
 *
 * @return {FollowResponse[]} - An array of freets created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.author !== undefined) {
      next();
      return;
    }

    const allFollows = await FollowCollection.findAll();
    const response = allFollows.map(util.constructFollowResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response, next: NextFunction) => {

    if (req.query.followers == "true") {
      next();
      return;
    }
    console.log("in following");
    const userFollowing = await FollowCollection.findAllFollowing(req.query.author as string);
    const response = userFollowing.map(util.constructFollowResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    console.log("in followers");
    const userFollowers = await FollowCollection.findAllFollowers(req.query.author as string);
    const response = userFollowers.map(util.constructFollowResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new freet.
 *
 * @name POST /api/follows
 *
 * @param {string} content - The content of the freet
 * @return {FollowResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    followValidator.isValidFollow
  ],
  async (req: Request, res: Response) => {
    console.log('plis');
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const follow = await FollowCollection.addOne(userId, req.body.dstUserId);

    res.status(201).json({
      message: 'Your follow was created successfully.',
      follow: util.constructFollowResponse(follow)
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
  '/:followId?',
  [
    userValidator.isUserLoggedIn,
    followValidator.isFollowExists,
  ],
  async (req: Request, res: Response) => {
    await FollowCollection.deleteOne(req.params.followId);
    res.status(200).json({
      message: 'Your freet was deleted successfully.'
    });
  }
);

export {router as followRouter};
