import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
} from "react-icons/fa6";

import NewsletterForm from "./NewsletterForm";
import FooterLinks from "./FooterLinks";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="text-3xl font-bold text-white">
              RentEase
            </Link>

            <p className="mt-5 leading-7">
              RentEase is a modern rental property management platform that
              connects tenants, landlords, and agents in one secure place.
            </p>

            <div className="mt-6 flex gap-4 text-xl">
              <a href="#">
                <FaFacebookF />
              </a>

              <a href="#">
                <FaInstagram />
              </a>

              <a href="#">
                <FaXTwitter />
              </a>

              <a href="#">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Links */}
          <FooterLinks />

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-xl font-semibold text-white">
              Contact Us
            </h3>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <FaPhone className="text-blue-400" />
                <span>+234 800 123 4567</span>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="text-blue-400" />
                <span>support@rentease.com</span>
              </div>

              <div className="flex items-start gap-3">
                <FaLocationDot className="mt-1 text-blue-400" />
                <span>
                  Ado-Ekiti,
                  <br />
                  Ekiti State, Nigeria
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <NewsletterForm />
        </div>

        <div className="mt-14 border-t border-slate-700 pt-8 text-center text-sm">
          © {year} RentEase. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
