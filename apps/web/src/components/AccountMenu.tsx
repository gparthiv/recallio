import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth.api";
import dropdownIcon from "../assets/dropdown.svg";

function AccountMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const username = localStorage.getItem("username");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
<div className="relative">
  <button
    type="button"
    onClick={() => setOpen((value) => !value)}
    aria-expanded={open}
    aria-haspopup="menu"
    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-soft hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
  >
    <span className="max-w-32 truncate sm:max-w-40">
      {username}
    </span>

    <img
      src={dropdownIcon}
      alt=""
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    />
  </button>

  {open && (
    <div
      className="absolute right-0 top-[calc(100%+8px)] z-30 w-44 overflow-hidden rounded-xl border border-black/5 bg-surface p-1.5 shadow-lg"
      role="menu"
    >
      <button
        type="button"
        onClick={handleLogout}
        role="menuitem"
        className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-soft hover:text-text focus:outline-none focus:bg-surface-soft"
      >
        Log out
      </button>
    </div>
  )}
</div>
  );
}

export default AccountMenu;