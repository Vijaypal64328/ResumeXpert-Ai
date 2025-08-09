import { Link } from "react-router-dom";

const PublicNavbar = () => {
  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">ResumeXpert</Link>
      <div>
        <Link
          to="/auth"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Login / Signup
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
