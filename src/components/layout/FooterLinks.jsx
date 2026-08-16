import { Link } from "react-router-dom";

function FooterLinks() {
  return (
    <div>
      <h3 className="mb-6 text-xl font-semibold text-white">Quick Links</h3>

      <div className="space-y-3">
        <Link to="/" className="block hover:text-white">
          Home
        </Link>

        <Link to="/properties" className="block hover:text-white">
          Properties
        </Link>

        <Link to="/about" className="block hover:text-white">
          About
        </Link>

        <Link to="/contact" className="block hover:text-white">
          Contact
        </Link>

        <Link to="/login" className="block hover:text-white">
          Login
        </Link>

        <Link to="/register" className="block hover:text-white">
          Register
        </Link>
      </div>
    </div>
  );
}

export default FooterLinks;
