import React from "react";
import { NavLink } from "react-router-dom";
import './Header.css';

const Header = () => {
  const pages = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Analytics", link: "/analytics" }
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
          {pages.map((page, index) => (
            <NavLink
              key={index}
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
