import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type FreetCredibilityScore = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  parentId: Types.ObjectId;
  sources: Array<string>;
  value: number;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Freets stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const FreetCredibilityScoreSchema = new Schema<FreetCredibilityScore>({
  parentId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Freet'
  },
  sources: {
    // Use Types.ObjectId outside of the schema
    type: [String],
    default: new Array<string>()
  },
  value: {
    // Use Types.ObjectId outside of the schema
    type: Number,
    default: 0.0
  },
});

const FreetCredibilityScoreModel = model<FreetCredibilityScore>('FreetCredibilityScore', FreetCredibilityScoreSchema);
export default FreetCredibilityScoreModel;
