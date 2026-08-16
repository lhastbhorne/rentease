import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

function SavePropertyButton() {
  const [saved, setSaved] = useState(false);

  function toggleSave() {
    setSaved((prev) => !prev);
  }

  return (
    <button
      onClick={toggleSave}
      className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition ${
        saved
          ? "bg-red-100 text-red-600"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {saved ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
      {saved ? "Saved" : "Save Property"}
    </button>
  );
}

export default SavePropertyButton;