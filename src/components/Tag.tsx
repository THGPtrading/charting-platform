// src/components/Tag.tsx
import React from 'react';

interface TagProps {
  label: string;
}

const Tag: React.FC<TagProps> = ({ label }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        margin: '2px',
        borderRadius: '6px',
        background: '#1f2937',
        color: '#e5e7eb',
        cursor: 'help',
      }}
      title={label}
    >
      {label}
    </span>
  );
};

export default Tag;