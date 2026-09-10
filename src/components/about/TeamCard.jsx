import { motion } from "framer-motion";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function TeamCard({ member }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group h-full"
    >
      <div className="h-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:border-blue-200 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
        {/* Image */}
        <div className="relative overflow-hidden">
          <motion.img
            src={member.image}
            alt={member.name}
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-80 w-full object-cover"
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-20rem)] flex-col p-7">
          <h3 className="text-2xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
            {member.name}
          </h3>

          <p className="mt-2 font-semibold text-blue-600 dark:text-blue-400">
            {member.position}
          </p>

          <p className="mt-4 flex-1 leading-7 text-slate-600 transition-colors duration-300 dark:text-slate-300">
            {member.bio}
          </p>

          {/* Social Links */}
          <div className="mt-6 flex gap-4">
            <motion.a
              href={member.socials.linkedin}
              whileHover={{ y: -3, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              aria-label={`${member.name} LinkedIn`}
            >
              <FaLinkedin />
            </motion.a>

            <motion.a
              href={member.socials.github}
              whileHover={{ y: -3, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl text-slate-500 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
              aria-label={`${member.name} GitHub`}
            >
              <FaGithub />
            </motion.a>

            <motion.a
              href={member.socials.twitter}
              whileHover={{ y: -3, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl text-slate-500 transition-colors hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400"
              aria-label={`${member.name} X`}
            >
              <FaXTwitter />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TeamCard;
