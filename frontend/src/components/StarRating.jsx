import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 24,
  showValue = false,
  count = 5,
}) => {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div
      className="star-rating"
      style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
      role={readOnly ? 'img' : 'group'}
      aria-label={`Rating: ${value} out of ${count} stars`}
    >
      {Array.from({ length: count }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= display;

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHovered(starValue)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0',
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'transform 0.1s',
              transform: !readOnly && hovered >= starValue ? 'scale(1.2)' : 'scale(1)',
            }}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              fill={filled ? '#f59e0b' : 'transparent'}
              stroke={filled ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {showValue && value > 0 && (
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', marginLeft: '0.3rem' }}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
