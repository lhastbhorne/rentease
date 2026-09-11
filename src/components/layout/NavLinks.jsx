import { NavLink } from "react-router-dom";

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Properties", path: "/properties" },
  { name: "Contact", path: "/contact" },
];

function NavLinks({ mobile = false, onClick }) {
  return (
    <ul className={mobile ? "flex flex-col gap-4" : "flex items-center gap-8"}>
      {links.map((link) => (
        <li key={link.name}>
          <NavLink
            to={link.path}
            onClick={onClick}
            className={({ isActive }) =>
              `font-medium transition ${
                isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`
            }
          >
            {link.name}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default NavLinks;
