import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
          {user?.displayName ? user.displayName[0] : user?.email?.[0] || "U"}
        </div>
        <div>
          <div className="text-lg font-semibold">{user?.displayName || "No Name"}</div>
          <div className="text-gray-500">{user?.email}</div>
        </div>
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded shadow">Edit Profile (Coming Soon)</button>
    </div>
  );
}
