import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Search } from 'lucide-react';
import { setCurrency } from '../store/currencySlice.js';

const CurrencySelector = ({ compact = false }) => {
  const dispatch = useDispatch();
  const { selected, currencies } = useSelector(state => state.currency);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentCurrency = currencies.find(c => c.code === selected) || { code: selected, symbol: '$', flag: '🌍' };

  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code) => {
    dispatch(setCurrency(code));
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }} id="currency-selector">
      <button
        className="currency-btn"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-label="Select currency"
      >
        <span style={{ fontSize: compact ? '1rem' : '1.1rem' }}>{currentCurrency.flag}</span>
        {!compact && <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentCurrency.code}</span>}
        {compact && <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{currentCurrency.code}</span>}
        <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div className="currency-dropdown" role="listbox" aria-label="Currency list">
          <div className="currency-search">
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="currency-search-input"
            />
          </div>
          <div className="currency-list" role="group">
            {filtered.map(c => (
              <button
                key={c.code}
                className={`currency-option ${c.code === selected ? 'selected' : ''}`}
                role="option"
                aria-selected={c.code === selected}
                onClick={() => handleSelect(c.code)}
              >
                <span className="currency-flag">{c.flag}</span>
                <span className="currency-code">{c.code}</span>
                <span className="currency-name">{c.name}</span>
                <span className="currency-symbol">{c.symbol}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No currencies found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
