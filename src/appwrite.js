import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const database = new Databases(client);

/**
 * Updates the search count for a given term.
 * If the term already exists in Appwrite, it increments the count.
 * If not, it creates a new document with count = 1.
 */
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];

      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.imdbID,
        poster_url: movie.Poster !== 'N/A' ? movie.Poster : '',
        title: movie.Title,
      });
    }
  } catch (error) {
    console.error('Failed to update search count:', error);
  }
};

/**
 * Fetches the top 5 trending movies based on search count.
 */
export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc('count'),
    ]);

    return result.documents;
  } catch (error) {
    console.error('Failed to fetch trending movies:', error);
    return [];
  }
};
