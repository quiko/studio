import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { UserProfile, userProfileSchema } from './constants';
import { ZodError } from 'zod';

export const userProfileConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore: (userProfile: UserProfile): DocumentData => {
    // When writing to Firestore, you typically just return the data object.
    // Zod validation is usually more critical when reading data.
    // If you needed to transform the data before writing, you would do it here.
    return userProfile;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserProfile => {
    const data = snapshot.data(options);

    const dataWithId = { ...data, id: snapshot.id };
    try {
      // Use the Zod schema to parse and validate the data including the snapshot ID
      const validatedData = userProfileSchema.parse(dataWithId);

      // Return the validated data, which is now guaranteed to match the UserProfile type
      return validatedData as UserProfile;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(`Firestore data validation failed for document ${snapshot.id}:`, JSON.stringify(error.errors, null, 2));
        // Depending on your application's requirements, you might:
        // - Throw the error to stop processing the invalid document
        // - Return a default UserProfile
        // - Log the error and skip this document
        // For now, we'll log and throw, as invalid data could cause unexpected behavior.
        throw new Error(`Invalid Firestore data for user profile ${snapshot.id}: ${error.errors.map(e => e.message).join(', ')}`);
      } else {
        console.error(`Error processing Firestore document ${snapshot.id}:`, error);
        throw new Error(`Error processing Firestore data for user profile ${snapshot.id}: ${error}`);
      }
    }
  },
};