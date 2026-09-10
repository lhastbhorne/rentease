import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

function SavePropertyButton() {
  const [saved, setSaved] = useState(false);

  function toggleSave() {
    setSaved((prev) => !prev);
  }

  return (
    <button
      type="button"
      onClick={toggleSave}
      className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
        saved
          ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
    >
      {saved ? <FaHeart size={18} /> : <FaRegHeart size={18} />}

      {saved ? "Saved" : "Save Property"}
    </button>
  );
}

export default SavePropertyButton;
