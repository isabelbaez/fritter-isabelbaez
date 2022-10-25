import LikeModel, { Like } from '../like/model';
import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import LikeCollection from 'like/collection';
import { freetCredibilityScoreRouter } from 'freetCredibilityScore/router';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type StructuredThread = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: Types.ObjectId;
  dateCreated: Date;
  content: Array<string>;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Freets stored in this table will have these fields, with the
// type given by the type property, inside MongoDB

const StructuredThreadSchema = new Schema<StructuredThread>({
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The date the freet was created
  dateCreated: {
    type: Date,
    required: true
  },
  // Add views field to the schema
  content: {
    type: [String],
    required: true
  },
});

const StructuredThreadModel = model<StructuredThread>('StructuredThread', StructuredThreadSchema);
export default StructuredThreadModel;
