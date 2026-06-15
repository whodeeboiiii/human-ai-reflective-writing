import type { WritingFrequency, UserInterventionWant } from './intervention';

export type GenreValue =
  | 'book-review'
  | 'place-review'
  | 'movie-review'
  | 'product-review'
  | 'travelogue'
  | 'reflection';

export type IdeaReadiness = 'none' | 'little' | 'some' | 'much' | 'almost_complete';
export type AudienceValue =
  | 'self'
  | 'close-circle'
  | 'interest-circle'
  | 'public'
  | 'undecided';
export type SharingValue = 'private' | 'close' | 'public' | 'undecided';
export type VenueValue =
  | 'personal-blog'
  | 'community'
  | 'official'
  | 'review-site'
  | 'press'
  | 'undecided'
  | 'none';
export type ToneValue = 'warm' | 'reflective' | 'critical' | 'humorous' | 'undecided';
export type LengthValue = 'short' | 'medium' | 'long';

export interface StructuredInput {
  genre?: GenreValue;
  topicSentence?: string;
  ideaReadiness?: IdeaReadiness;
  writingFrequency?: WritingFrequency;
  userInterventionWant?: UserInterventionWant;
  audience?: AudienceValue;
  sharing?: SharingValue;
  venue?: VenueValue;
  tone?: ToneValue;
  expectedLength?: LengthValue;
}
