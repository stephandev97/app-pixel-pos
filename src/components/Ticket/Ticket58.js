// src/components/Ticket/Ticket58.js

import React from 'react';

import logo from '../../styles/img/logoprint.png';
// Asegúrate de que estas rutas de importación sean correctas desde este nuevo archivo
import { formatPrice } from '../../utils/formatPrice';

const Ticket58 = React.forwardRef(
  ({ direccion, items, total, method, pagoEfectivo, pagoMp }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '40mm',
          padding: '1mm',
          lineHeight: 1.25,
          fontSize: '3.2mm',
          color: '#000',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: '30mm', height: 'auto', display: 'block', margin: '0 auto' }}
          />
        </div>
        <div style={{ width: '100%', textAlign: 'center', margin: '1.5mm 0 .8mm' }}>
          <div style={{ fontSize: '3.5mm', fontWeight: 700 }}>{direccion || ''}</div>
        </div>
        <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />
        <div style={{ width: '100%', margin: '1.5mm 0' }}>
          <div style={{ display: 'flex', fontWeight: 'bold', marginBottom: '1mm' }}>
            <span>#</span>
            <span style={{ flex: 1, textAlign: 'left', marginLeft: '5mm' }}>Producto</span>
          </div>
          {(items || []).map((it, idx) => (
            <div key={idx} style={{ marginBottom: '1mm' }}>
              {/* ...código interno del map de items... */}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <a>Total</a>
          <a>{formatPrice(total)}</a>
        </div>
        {/* ...lógica de pago mixto/efectivo... */}
        <div style={{ borderTop: '1px dashed #000', margin: '24px 0' }} />
      </div>
    );
  }
);

Ticket58.displayName = 'Ticket58';

export default Ticket58;
