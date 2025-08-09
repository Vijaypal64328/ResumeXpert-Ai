import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaPencilAlt } from 'react-icons/fa';
import uploadFile from '../utils/uploadFile'; // ✅ use utility

const UpdateProfile = () => {
  const { currentUser, updateEmail, updatePassword, updateUserProfile, logout } = useAuth();
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(currentUser.photoURL || '');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setPreview(currentUser.photoURL || '');
  }, [currentUser.photoURL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const profileData = {};

      if (displayName !== currentUser.displayName) {
        profileData.displayName = displayName;
      }

      if (photoFile) {
        const filePath = `profiles/${currentUser.uid}/${photoFile.name}`;
        const downloadUrl = await uploadFile(photoFile, filePath);
        profileData.photoURL = downloadUrl;
        setPreview(downloadUrl);
      }

      if (Object.keys(profileData).length > 0) {
        await updateUserProfile(profileData);
      }

      if (email !== currentUser.email) {
        await updateEmail(email);
      }

      if (password) {
        await updatePassword(password);
      }

      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="flex justify-center">
          <div className="relative">
            <img src={preview} alt="Profile" className="h-24 w-24 rounded-full object-cover border" />
            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-gray-200 rounded-full p-1 cursor-pointer">
              <FaPencilAlt className="text-gray-600" />
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                setPhotoFile(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </div>
        </div>
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Leave blank to keep same"
          />
        </div>
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save Changes
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button type="button" onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Sign Out
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
