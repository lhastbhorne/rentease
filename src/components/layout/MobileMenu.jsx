import { Link } from "react-router-dom";

import NavLinks from "./NavLinks";

function MobileMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 md:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-[72px] left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 md:hidden">
        <div className="container mx-auto px-6 py-5">
          <NavLinks mobile onClick={onClose} />

          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={onClose}
              className="rounded-lg border border-blue-600 py-2 text-center text-blue-600 transition hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className="rounded-lg bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
