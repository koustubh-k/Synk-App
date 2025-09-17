import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { userApi } from "@/api/userApi";
import useAuthStore from "@/store/authStore";

const ProfilePage = () => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!avatarFile) {
      setError("Please select an image to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await userApi.uploadAvatar(formData);
      // Update user avatar in auth store
      if (user) {
        login({ ...user, avatar: response.avatar });
      }
      setSuccessMessage("Avatar uploaded successfully.");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload avatar.";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Avatar</label>
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="w-32 h-32 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-gray-500">
              No Avatar
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {successMessage && (
          <p className="text-green-600 mb-2">{successMessage}</p>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Avatar"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
