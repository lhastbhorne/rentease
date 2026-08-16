import { Link } from "react-router-dom";

import NavLinks from "./NavLinks";

function MobileMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-[72px] left-0 right-0 z-50 border-t bg-white shadow-lg md:hidden">
        <div className="container mx-auto px-6 py-5">
          <NavLinks mobile onClick={onClose} />

          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={onClose}
              className="rounded-lg border border-blue-600 py-2 text-center text-blue-600 transition hover:bg-blue-50"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className="rounded-lg bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
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
