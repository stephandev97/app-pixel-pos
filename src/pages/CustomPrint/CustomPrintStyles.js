import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 16px 20px 32px;
  box-sizing: border-box;
  background: #f8fafc;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
  align-items: center;

  @media (max-width: 900px) {
    padding: 12px 14px 24px;
  }
`;

export const PageWrapper = styled.div`
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
`;

export const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;

  .title-area {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-badge {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4d0012 0%, #2d000a 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(77, 0, 18, 0.2);
    }

    h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    p {
      font-size: 12px;
      color: #64748b;
      margin: 2px 0 0;
      font-weight: 500;
    }
  }
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  align-items: start;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 0;
  min-width: 0;

  @media (max-width: 800px) {
    position: static;
  }
`;

export const Card = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
`;

export const CardTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;

  span.badge {
    font-size: 11px;
    font-weight: 600;
    background: #fff0f3;
    color: #4d0012;
    padding: 2px 7px;
    border-radius: 6px;
  }
`;

export const PresetsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const PresetPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    border-color: #4d0012;
    color: #4d0012;
    background: #fff8f9;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(77, 0, 18, 0.08);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12.5px;
    font-weight: 700;
    color: #475569;
    display: flex;
    justify-content: space-between;
    align-items: center;

    span.counter {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
    }
  }

  input,
  textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
    background: #fff;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:focus {
      border-color: #4d0012;
      box-shadow: 0 0 0 3px rgba(77, 0, 18, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  textarea {
    resize: vertical;
    min-height: 90px;
    line-height: 1.5;
  }
`;

export const RowTwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const OrientationSelector = styled.div`
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 4px;

  button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 8px;
    border: none;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    background: transparent;
    color: #64748b;
    transition: all 0.15s ease;

    &.active {
      background: #fff;
      color: #4d0012;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }
  }
`;

export const OptionsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
`;

export const ToggleOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  user-select: none;

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #4d0012;
    cursor: pointer;
  }
`;

export const CopiesControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  span.label {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .stepper {
    display: inline-flex;
    align-items: center;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    overflow: hidden;

    button {
      background: #f8fafc;
      border: none;
      width: 32px;
      height: 32px;
      font-size: 16px;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;

      &:hover {
        background: #f1f5f9;
        color: #4d0012;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    span.value {
      width: 36px;
      text-align: center;
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
    }
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 6px;
`;

export const PrintButton = styled.button`
  flex: 1;
  height: 48px;
  background: linear-gradient(135deg, #4d0012 0%, #2d000a 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(77, 0, 18, 0.3);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(77, 0, 18, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #94a3b8;
    box-shadow: none;
  }
`;

export const ClearButton = styled.button`
  height: 48px;
  padding: 0 18px;
  background: #fff;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f8fafc;
    color: #0f172a;
    border-color: #94a3b8;
  }
`;

/* ==========================================================
   VISTA PREVIA DE TICKET TÉRMICO (Realistic 58mm Thermal Preview)
   ========================================================== */

export const ThermalPreviewCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
`;

export const ThermalPaper = styled.div`
  width: 100%;
  max-width: 240px;
  background: #fffdfa;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 16px 14px 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
  font-family: 'Inter', -apple-system, sans-serif;
  color: #111;
  font-size: 11px;
  line-height: 1.3;
  position: relative;
  box-sizing: border-box;
  margin: 0 auto;

  /* Efecto de borde dentado de corte de ticket térmico */
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    right: 0;
    height: 6px;
    background: radial-gradient(circle, transparent, transparent 50%, #fffdfa 50%, #fffdfa 100%);
    background-size: 10px 10px;
  }

  .ticket-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 22px;
    padding-top: 4px;

    img {
      width: 90px;
      height: auto;
      filter: grayscale(100%) contrast(150%);
    }

    .ticket-subtitle {
      font-size: 8.5px;
      letter-spacing: 1.2px;
      color: #333;
      text-transform: uppercase;
      font-weight: 700;
      margin-top: 3px;
    }
  }

  .ticket-dashed {
    border-top: 1px dashed #333;
    margin: 8px 0;
  }

  .ticket-title {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
    font-weight: 900;
    font-size: 14.5px;
    letter-spacing: 0.6px;
    margin: 8px 0 14px;
    padding: 5px 0;
    border-top: 1.2px solid #111;
    border-bottom: 1.2px solid #111;
    text-transform: uppercase;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

    .title-heart {
      flex-shrink: 0;
      font-size: 13px;
      line-height: 1.25;
    }

    .title-text {
      flex: 1;
      text-align: center;
      word-break: break-word;
      white-space: normal;
      line-height: 1.25;
    }
  }

  .ticket-to {
    text-align: center;
    margin: 10px 0 12px;

    .to-label {
      font-size: 9px;
      font-style: italic;
      font-family: 'Georgia', serif;
      color: #555;
    }

    .to-name {
      font-weight: 800;
      font-size: 12.5px;
      color: #000;
      letter-spacing: 0.3px;
    }
  }

  .ticket-message-box {
    border: 1.5px solid #111;
    border-radius: 6px;
    padding: 10px 8px;
    margin: 12px 0 10px;
    text-align: center;
    background: #fff;

    .ticket-message-text {
      font-size: ${({ $largeText }) => ($largeText ? '12.5px' : '11px')};
      font-weight: 600;
      font-family: 'Georgia', 'Cambria', serif;
      font-style: italic;
      line-height: 1.35;
      white-space: pre-wrap;
      word-break: break-word;
      padding: 2px 0;
      color: #111;
    }
  }

  .ticket-from {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 5px;
    margin-top: 10px;
    margin-bottom: 12px;
    padding-right: 2px;
    text-align: right;
    flex-wrap: wrap;

    .from-label {
      font-size: 10px;
      font-style: italic;
      font-family: 'Caveat', cursive, 'Georgia', serif;
      color: #555;
    }

    .from-name {
      font-weight: 800;
      font-size: 11.5px;
      color: #000;
    }
  }

  .ticket-footer {
    text-align: center;
    margin-top: 14px;
    padding-top: 8px;
    border-top: 1px dashed #333;

    .footer-highlight {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.4px;
      color: #111;
    }

    .footer-brand {
      font-size: 8px;
      letter-spacing: 1px;
      color: #555;
      text-transform: uppercase;
      margin-top: 2px;
    }
  }
`;

export const ThermalRibbon = styled.div`
  width: 100%;
  max-width: 380px;
  background: #fffdfa;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 12px 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
  font-family: 'Inter', -apple-system, sans-serif;
  color: #111;
  font-size: 11px;
  line-height: 1.3;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;

  .ribbon-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-right: 1.2px dashed #333;
    padding-right: 10px;
    min-width: 115px;
    max-width: 135px;
    text-align: center;

    img {
      width: 50px;
      height: auto;
      filter: grayscale(100%) contrast(150%);
    }

    .ribbon-title {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 900;
      margin-top: 5px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      line-height: 1.2;
      border-top: 1.2px solid #111;
      border-bottom: 1.2px solid #111;
      padding: 3px 2px;
      font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;

      .title-heart {
        flex-shrink: 0;
        font-size: 10px;
        line-height: 1.2;
      }

      .title-text {
        flex: 1;
        text-align: center;
        word-break: break-word;
        white-space: normal;
        line-height: 1.2;
      }
    }
  }

  .ribbon-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .ribbon-header-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
    }

    .ribbon-to {
      display: flex;
      align-items: baseline;
      gap: 4px;
      min-width: 0;

      .to-label {
        font-size: 10px;
        font-style: italic;
        font-family: 'Caveat', cursive, 'Georgia', serif;
        color: #555;
        flex-shrink: 0;
      }

      .to-name {
        font-size: 11.5px;
        font-weight: 800;
        color: #000;
        font-family: 'Playfair Display', 'Georgia', serif;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .ribbon-from {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-left: auto;
      min-width: 0;

      .from-label {
        font-size: 10px;
        font-style: italic;
        font-family: 'Caveat', cursive, 'Georgia', serif;
        color: #555;
        flex-shrink: 0;
      }

      .from-name {
        font-size: 11px;
        font-weight: 800;
        color: #000;
        font-family: 'Playfair Display', 'Georgia', serif;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .ribbon-message-box {
      border: 1.5px solid #111;
      border-radius: 6px;
      padding: 6px 10px;
      background: #fff;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;

      .ribbon-message-text {
        font-size: ${({ $largeText }) => ($largeText ? '11.5px' : '10.5px')};
        font-weight: 600;
        font-family: 'Lora', 'Playfair Display', 'Georgia', serif;
        font-style: italic;
        line-height: 1.3;
        white-space: pre-wrap;
        word-break: break-word;
        color: #111;
        width: 100%;
      }
    }

    .ribbon-footer {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.3px;
      color: #111;
      text-align: center;
      padding-top: 2px;
      font-family: 'Playfair Display', 'Georgia', serif;
    }
  }
`;

/* ==========================================================
   DOM IMPRIMIBLE OCULTO (Exact 58mm Thermal Print Layout)
   ========================================================== */

export const HiddenPrintRoot = styled.div`
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;

  @media print {
    position: static;
    left: auto;
    top: auto;
    opacity: 1;
    display: block !important;
  }
`;

export const ThermalPrintDocument = styled.div`
  width: 48mm;
  max-width: 48mm;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  line-height: 1.25;
  font-size: 3.6mm;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #000;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;

  .print-logo-box {
    text-align: center;
    margin-bottom: 2mm;

    img {
      width: 28mm;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  }

  .print-dashed {
    border-top: 1px dashed #000;
    margin: 2mm 0;
  }

  .print-title {
    text-align: center;
    font-size: 3.9mm;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 1.2;
    margin: 1mm 0;
  }

  .print-date {
    text-align: center;
    font-size: 3mm;
    color: #333;
    margin-bottom: 1.5mm;
  }

  .print-to {
    font-size: 3.8mm;
    font-weight: 800;
    margin: 1.5mm 0 1mm;
    word-break: break-word;
  }

  .print-message {
    font-size: ${({ $largeText }) => ($largeText ? '4mm' : '3.6mm')};
    font-weight: 700;
    padding: 1.5mm 0;
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.3;
  }

  .print-from {
    font-size: 3.6mm;
    font-weight: 700;
    text-align: right;
    margin-top: 1.5mm;
  }

  .print-footer {
    text-align: center;
    font-size: 3.1mm;
    font-weight: 600;
    margin-top: 1.5mm;
  }
`;

export const ThermalPrintRotated = styled.div`
  width: 48mm;
  max-width: 48mm;
  height: 180mm;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  background: #fff;
  color: #000;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;

  .rotated-content {
    transform-origin: top left;
    transform: rotate(90deg) translateY(-48mm);
    width: 140mm;
    height: 48mm;
    box-sizing: border-box;
    padding: 2mm 3mm;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 3mm;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  .rot-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-right: 1px dashed #000;
    padding-right: 3mm;
    min-width: 25mm;
    text-align: center;

    img {
      width: 20mm;
      height: auto;
    }
    .rot-title {
      font-size: 3.4mm;
      font-weight: 800;
      margin-top: 1mm;
      text-transform: uppercase;
    }
    .rot-date {
      font-size: 2.6mm;
      color: #333;
      margin-top: 0.5mm;
    }
  }

  .rot-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1mm;

    .rot-to {
      font-size: 3.6mm;
      font-weight: 800;
    }
    .rot-message {
      font-size: ${({ $largeText }) => ($largeText ? '4mm' : '3.5mm')};
      font-weight: 700;
      font-style: italic;
      line-height: 1.25;
      word-break: break-word;
    }
    .rot-from {
      font-size: 3.3mm;
      font-weight: 700;
      text-align: right;
    }
    .rot-footer {
      font-size: 2.6mm;
      text-align: center;
      margin-top: 1mm;
      border-top: 1px dashed #bbb;
      padding-top: 0.5mm;
    }
  }
`;

/* ==========================================================
   HISTORIAL DE DEDICATORIAS RECIENTES
   ========================================================== */

export const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.15s;

  &:hover {
    background: #fff;
    border-color: #cbd5e1;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  }

  .info {
    flex: 1;
    min-width: 0;
    margin-right: 10px;

    .top-line {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }

    .msg-preview {
      font-size: 11.5px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
  }

  .actions {
    display: flex;
    gap: 6px;

    button {
      padding: 5px 9px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: #fff;
      color: #334155;
      cursor: pointer;
      transition: all 0.12s;

      &:hover {
        border-color: #4d0012;
        color: #4d0012;
        background: #fff8f9;
      }
    }
  }
`;
