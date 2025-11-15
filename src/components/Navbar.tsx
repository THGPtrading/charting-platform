import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    marginRight: '8px',
    backgroundColor: '#e6e6fa', // lavender background
    border: '1px solid black',  // thin black border
    borderBottom: 'none',       // tab look
    borderRadius: '4px 4px 0 0',
    color: '#374151',
  };

  const activeStyle: React.CSSProperties = {
    backgroundColor: '#2563eb',
    color: 'white',
    fontWeight: 'bold',
    border: '1px solid black', // keep active highlight but add black border
  };

  return (
    <nav style={{ padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #ddd' }}>
      {[
        { to: '/', label: 'Summary' },
        { to: '/momentum', label: '⚡ MomentumEdge' },
        { to: '/trend', label: '📈 TrendEdge' },
        { to: '/warrior', label: '🛡️ WarriorEdge' },
        { to: '/tracker', label: 'Tracker' },
        { to: '/icc', label: 'ICC Page' },
        { to: '/test', label: 'Test Harness' },
      ].map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeStyle : {}),
          })}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;