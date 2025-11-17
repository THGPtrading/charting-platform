// src/components/Navbar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <ul className="nav-tabs">
        <li>
          <NavLink
            to="/summary"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Summary
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/warrioredge"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            WarriorEdge
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/momentumedge"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            MomentumEdge
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/trendedge"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            TrendEdge
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/tracker"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Tracker
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/icc"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            ICC Page
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/testharness"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Test Harness
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/multi"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            MultiDashboard
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;