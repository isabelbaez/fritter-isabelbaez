import ContestCredibilityCollection from '../contestCredibility/collection';
import type {HydratedDocument, Types} from 'mongoose';
import type {FreetCredibilityScore} from './model';
import FreetCredibilityScoreModel from './model';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FreetCredibilityScoreCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} parentId - The id of the freet/comment being score
   * @param {string} sources - List of sources to determine the score 
   * @return {Promise<HydratedDocument<FreetCredibilityScore>>} - The newly created score
   */
  static async addOne(parentId: Types.ObjectId | string, sources: Array<string>): Promise<HydratedDocument<FreetCredibilityScore>> {

    const value: number = Math.min((sources.length*4)/5.0,5.0);

    const score = new FreetCredibilityScoreModel({
      parentId,
      sources, 
      value,
    });

    await score.save(); // Saves freet to MongoDB
    // set state for Freet
    return score;
  }

  /**
   * Find a score by scoreId
   *
   * @param {string} scoreId - The id of the score to find
   * @return {Promise<HydratedDocument<Like>> | Promise<null> } - The score with the given scoreId, if any
   */
  static async findOne(scoreId: Types.ObjectId | string): Promise<HydratedDocument<FreetCredibilityScore>> {
    return FreetCredibilityScoreModel.findOne({_id: scoreId});
  }

  /**
   * Get all the scores in the database
   *
   * @return {Promise<HydratedDocument<FreetCredibilityScore>[]>} - An array of all of the scores
   */
  static async findAll(): Promise<Array<HydratedDocument<FreetCredibilityScore>>> {
    return FreetCredibilityScoreModel.find({}).sort({dateCreated: -1});
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<FreetCredibilityScore>[]>} - The score
   */
  static async findOneByParent (parentId: Types.ObjectId | string): Promise<HydratedDocument<FreetCredibilityScore>> {
    return FreetCredibilityScoreModel.findOne({parentId: parentId});
  }

  /**
   * Update a score
   *
   * @param {string} scoreId - The id of the score to update
   * @return {Promise<HydratedDocument<FreetCredibilityScore>[]>} - The updated score
   */
  static async updateScore (scoreId: Types.ObjectId | string, delta: number): Promise<HydratedDocument<FreetCredibilityScore>> {
    
    const score =  await FreetCredibilityScoreModel.findOne({_id: scoreId});

    score.value += delta;
    await score.save(); // Saves freet to MongoDB
    // set state for Freet
    return score;
  }

  /**
   * Delete a score with given scoreId.
   *
   * @param {string} scoreId - The scoreId of score to delete
   * @return {Promise<Boolean>} - true if the score has been deleted, false otherwise
   */
  static async deleteOne(scoreId: Types.ObjectId | string): Promise<boolean> {
  
    const score = await FreetCredibilityScoreModel.findOne({_id: scoreId});
    const delScore = await FreetCredibilityScoreModel.deleteOne({_id: scoreId});

    const contests = await ContestCredibilityCollection.findAllByParent(scoreId);

    for (const contest of contests) {
      ContestCredibilityCollection.deleteOne(contest._id);
    }
    
    return delScore !== null;
  }
}

export default FreetCredibilityScoreCollection;
