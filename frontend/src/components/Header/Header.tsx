import { NavLink } from "react-router-dom";
import "./Header.css";

interface Page {
  name: string;
  link: string;
}

const Header = () => {
  const pages: Page[] = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Analytics", link: "/analytics" },
  ];

  return (
    <div className="navbar">
      {/* Left section: hamburger + nav links */}
      <div className="left-section">
        <div className="hamburger">
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>

        <div className="nav-links">
          {pages.map((page) => (
            <NavLink
              key={page.link}
              to={page.link}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              {page.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right section: profile pic */}
      <div className="profile-pic-container">
        <img
          src="https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747492996/Rectangle_6_sn6jym.png"
          alt="Profile"
          className="profile-pic"
        />
      </div>
    </div>
  );
};

export default Header;
