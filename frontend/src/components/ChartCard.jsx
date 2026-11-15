import React from 'react';

const ChartCard = ({ title, subtitle, icon: Icon, actions, children, height = 300 }) => {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {Icon && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={18} />
            </div>
          )}
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
        </div>

        {actions && <div>{actions}</div>}
      </div>

      <div style={{ flex: 1, minHeight: height, width: '100%', marginTop: '8px' }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
