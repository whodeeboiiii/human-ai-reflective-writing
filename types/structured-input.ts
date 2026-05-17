export type GenreValue =
  | 'commentary'
  | 'critique'
  | 'book-report'
  | 'review'
  | 'travelogue'
  | 'reflection';

export type ClarityValue = 'none' | 'somewhat' | 'mostly' | 'clear';
export type ExperienceValue = 'none' | 'casual' | 'frequent' | 'professional';
export type ImportanceValue = 1 | 2 | 3 | 4;
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
  ideaClarity?: ClarityValue;
  writingExperience?: ExperienceValue;
  importance?: ImportanceValue;
  audience?: AudienceValue;
  sharing?: SharingValue;
  venue?: VenueValue;
  tone?: ToneValue;
  expectedLength?: LengthValue;
}
