import { FaLinkedin, FaGithub } from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

function TeamCard({ member }) {
  return (
    <div className="group overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <img
        src={member.image}
        alt={member.name}
        className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="p-7">
        <h3 className="text-2xl font-bold text-slate-900">{member.name}</h3>

        <p className="mt-2 font-semibold text-blue-600">{member.position}</p>

        <p className="mt-4 leading-7 text-slate-600">{member.bio}</p>

        <div className="mt-6 flex gap-4">
          <a
            href={member.socials.linkedin}
            className="text-2xl text-slate-500 transition hover:text-blue-600"
            aria-label={`${member.name} LinkedIn`}
          >
            <FaLinkedin />
          </a>

          <a
            href={member.socials.github}
            className="text-2xl text-slate-500 transition hover:text-black"
            aria-label={`${member.name} GitHub`}
          >
            <FaGithub />
          </a>

          <a
            href={member.socials.twitter}
            className="text-2xl text-slate-500 transition hover:text-sky-500"
            aria-label={`${member.name} X`}
          >
            <FaXTwitter />
          </a>
        </div>
      </div>
    </div>
  );
}

export default TeamCard;
