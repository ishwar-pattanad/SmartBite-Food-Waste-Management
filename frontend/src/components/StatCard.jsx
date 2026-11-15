import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendType = 'positive', // 'positive' (good - green) or 'negative' (bad - red)
  subtitle,
  theme = 'green', // green, orange, red, blue
}) => {
  const themeColors = {
    green: {
      borderTop: '3px solid #15803D',
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
    orange: {
      borderTop: '3px solid #F97316',
      iconBg: '#FFEDD5',
      iconColor: '#C2410C',
    },
    red: {
      borderTop: '3px solid #EF4444',
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
    },
    blue: {
      borderTop: '3px solid #3B82F6',
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
  };

  const currentTheme = themeColors[theme] || themeColors.green;

  return (
    <div
      className="card"
      style={{
        borderTop: currentTheme.borderTop,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {value}
            </span>
            {unit && (
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#64748B' }}>
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: currentTheme.iconBg,
              color: currentTheme.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
        {trend && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: trendType === 'positive' ? '#DCFCE7' : '#FEE2E2',
              color: trendType === 'positive' ? '#15803D' : '#DC2626',
            }}
          >
            {trendType === 'positive' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            <span>{trend}</span>
          </div>
        )}
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
