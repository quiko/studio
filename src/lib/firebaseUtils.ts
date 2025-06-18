import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getApp } from "firebase/app"; // Assuming you have Firebase app initialized elsewhere
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique filenames
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const db = getFirestore(getApp());

export const updateContractPdfUrl = async (contractId: string, pdfUrl: string) => {
  const contractRef = doc(db, "contracts", contractId);
  await updateDoc(contractRef, { pdfUrl });
};

// Get a reference to the storage service
const storage = getStorage(getApp()); // Use your initialized Firebase app

export const uploadPdfToFirebaseStorage = async (pdfBlob: Blob, filename: string): Promise<string> => {
  // Generate a unique filename
  const uniqueFilename = `${uuidv4()}_${filename}`;
  const storageRef = ref(storage, `contracts/${uniqueFilename}`);

  try {
    // Upload the blob to Firebase Storage
    const snapshot = await uploadBytes(storageRef, pdfBlob);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("PDF uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading PDF to Firebase Storage:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};