import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type ContestCredibility = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  parentId: Types.ObjectId;
  inFavor: boolean;
  sources: Array<string>;
  delta: number;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Freets stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const ContestCredibilitySchema = new Schema<ContestCredibility>({
  parentId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'FreetCredibilityScore'
  },
  inFavor: {
    // Use Types.ObjectId outside of the schema
    type: Boolean,
    required: true,
  },
  sources: {
    // Use Types.ObjectId outside of the schema
    type: [String],
    default: new Array<string>()
  },
  delta: {
    // Use Types.ObjectId outside of the schema
    type: Number,
    default: 0.0
  },
});

const ContestCredibilityModel = model<ContestCredibility>('ContestCredibility', ContestCredibilitySchema);
export default ContestCredibilityModel;
