import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

// Uploads a file to Firebase Storage and returns the download URL.
const uploadFile = async (file, path) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `${path}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {}, // Optional: Track progress
      (error) => reject(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => resolve(url))
          .catch((err) => reject(err));
      }
    );
  });
};

export default uploadFile;
