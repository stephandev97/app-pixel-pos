import {
  Clock,
  Copy,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  ScrollText,
  Sparkles,
  Trash2,
  User,
  CheckCircle2,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

import { logoBase64 } from '../../utils/logoBase64';
import {
  ButtonContainer,
  Card,
  CardTitle,
  ClearButton,
  Container,
  ContentGrid,
  CopiesControl,
  FormGroup,
  HeaderSection,
  HiddenPrintRoot,
  HistoryContainer,
  HistoryItem,
  LeftColumn,
  OptionsSection,
  OrientationSelector,
  PageWrapper,
  PresetPill,
  PresetsContainer,
  PrintButton,
  RightColumn,
  RowTwoCols,
  ThermalPaper,
  ThermalPreviewCard,
  ThermalPrintDocument,
  ThermalPrintRotated,
  ThermalRibbon,
  ToggleOption,
} from './CustomPrintStyles';

const PRESET_TEMPLATES = [
  {
    icon: '📝',
    label: 'Nuevo',
    title: '',
    message: '',
    clearAll: true,
  },
  {
    icon: '🎂',
    label: 'Cumpleaños',
    title: '¡FELIZ CUMPLEAÑOS!',
    message: '¡Que los cumplas muy feliz! Que disfrutes mucho de este momento tan especial y de todas las cosas ricas.',
  },
  {
    icon: '❤️',
    label: 'Con Amor',
    title: 'CON MUCHO AMOR',
    message: 'Para la persona más linda y especial. ¡Te amo muchísimo!',
  },
  {
    icon: '🌸',
    label: 'Feliz Día',
    title: '¡FELIZ DÍA!',
    message: '¡Feliz día! Gracias por ser tan genial y alegrarnos cada momento.',
  },
  {
    icon: '🎓',
    label: 'Felicitaciones',
    title: '¡FELICITACIONES!',
    message: '¡Muchas felicitaciones por este gran logro! ¡A festejar como se debe!',
  },
  {
    icon: '✨',
    label: 'Gracias',
    title: '¡MUCHAS GRACIAS!',
    message: '¡Muchísimas gracias por todo tu apoyo y cariño de siempre!',
  },
  {
    icon: '🎁',
    label: 'Regalo',
    title: 'UN REGALO ESPECIAL',
    message: 'Un detalle pensado con mucho cariño para vos. ¡Que lo disfrutes un montón!',
  },
  {
    icon: '🍦',
    label: 'Que lo disfrutes',
    title: '¡A DISFRUTAR!',
    message: 'Esperamos que disfrutes un montón de este pedido. ¡Hecho con mucho amor!',
  },
  {
    icon: '☀️',
    label: 'Lindo Día',
    title: '¡LINDO DÍA!',
    message: '¡Que tengas un día tan dulce y alegre como este helado!',
  },
];

const STORAGE_KEY = 'pixel_custom_prints_history';

export default function CustomPrint() {
  const printRef = useRef(null);

  const isAdmin = useSelector((state) => state.actions?.isAdmin);
  const isDev = process.env.NODE_ENV === 'development' || Boolean(isAdmin);

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');

  // Cálculo de palabra única para ajustar tamaño de título
  const trimmedTitle = title.trim();
  const words = trimmedTitle ? trimmedTitle.split(/\s+/) : [];
  const isSingleWord = words.length === 1;
  const isLongSingleWord = isSingleWord && trimmedTitle.length >= 10;
  const isVeryLongSingleWord = isSingleWord && trimmedTitle.length >= 15;

  // Opciones de impresión
  const [orientation, setOrientation] = useState('vertical'); // 'vertical' | 'horizontal'
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeFooter, setIncludeFooter] = useState(true);
  const [largeText, setLargeText] = useState(true);
  const [copies, setCopies] = useState(1);

  // Estados de UI
  const [isPrinting, setIsPrinting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [history, setHistory] = useState([]);

  // Cargar historial al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error cargando historial de dedicatorias:', e);
    }
  }, []);

  const saveHistoryToStorage = (newHistory) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error guardando historial:', e);
    }
  };

  const addToHistory = (item) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 8);
    saveHistoryToStorage(updated);
  };

  const clearHistory = () => {
    saveHistoryToStorage([]);
  };

  // Fecha y hora formateada en tiempo real
  const currentFormattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [isPrinting]);

  // Handler para aplicar plantilla
  const handleApplyPreset = (preset) => {
    if (preset.clearAll) {
      handleClear();
      return;
    }
    setTitle(preset.title);
    setMessage(preset.message);
  };

  // Handler para limpiar formulario
  const handleClear = () => {
    setTitle('');
    setRecipient('');
    setMessage('');
    setSender('');
  };

  // Cargar dedicatoria desde el historial
  const handleLoadHistory = (item) => {
    setTitle(item.title || '');
    setRecipient(item.recipient || '');
    setMessage(item.message || '');
    setSender(item.sender || '');
  };

  // Impresión vía navegador (react-to-print)
  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page { size: 58mm auto; margin: 0; }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 48mm;
          background: #fff;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          box-sizing: border-box;
        }
      }
    `,
    removeAfterPrint: true,
  });

  // Handler de impresión principal (Electron / Web)
  const handlePrint = async () => {
    if (isPrinting) return;
    if (!message.trim() && !recipient.trim()) return;

    setIsPrinting(true);
    try {
      const el = printRef.current;
      if (el) {
        const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,600;1,700&family=Lora:ital,wght@0,600;1,600&display=swap');

      @page {
        size: 48mm auto;
        margin: 0;
      }
      html, body {
        width: 40mm;
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: 'Playfair Display', 'Georgia', 'Cambria', 'Segoe UI', serif;
        color: #000000;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      img {
        max-width: 28mm !important;
        width: 28mm !important;
        height: auto !important;
        display: block !important;
        margin: 0 auto !important;
      }
      .font-card-title {
        font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      }
      .font-handwritten {
        font-family: 'Caveat', 'Dancing Script', 'Segoe Script', 'Brush Script MT', 'Georgia', cursive !important;
      }
      .font-card-name {
        font-family: 'Playfair Display', 'Georgia', 'Arial Black', serif, sans-serif !important;
      }
      .font-card-message {
        font-family: 'Lora', 'Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', serif !important;
      }
      .font-quotes {
        font-family: 'Playfair Display', 'Georgia', serif !important;
      }
      .font-card-footer {
        font-family: 'Playfair Display', 'Georgia', serif !important;
      }
    </style>
  </head>
  <body>
    ${el.outerHTML}
  </body>
</html>
`;
        for (let i = 0; i < copies; i++) {
          if (window.electron?.ipcRenderer) {
            await window.electron.ipcRenderer.invoke('print-ticket', html);
          } else {
            await reactToPrintFn?.();
          }
        }
      }

      // Guardar en historial
      addToHistory({
        id: Date.now(),
        title: title.trim(),
        recipient: recipient.trim(),
        message: message.trim(),
        sender: sender.trim(),
        date: currentFormattedDate,
      });

      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } catch (err) {
      console.error('Error al imprimir dedicatoria:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const hasContent = Boolean(message.trim() || recipient.trim() || sender.trim());

  return (
    <Container>
      <PageWrapper>
        <HeaderSection>
          <div className="title-area">
            <div>
              <h1>Notas & Dedicatorias</h1>
            </div>
          </div>

        {successToast && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <CheckCircle2 size={18} />
            <span>¡Ticket de dedicatoria impreso con éxito!</span>
          </div>
        )}
      </HeaderSection>

      <ContentGrid>
        {/* COLUMNA IZQUIERDA: Formulario y Plantillas */}
        <LeftColumn>
          {/* Tarjeta de Plantillas Rápidas */}
          <Card>
            <CardTitle>
              <span>Plantillas Rápidas</span>
              <span className="badge">1-Clic</span>
            </CardTitle>
            <PresetsContainer>
              {PRESET_TEMPLATES.map((preset, idx) => (
                <PresetPill key={idx} type="button" onClick={() => handleApplyPreset(preset)}>
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </PresetPill>
              ))}
            </PresetsContainer>
          </Card>

          {/* Tarjeta de Contenido del Mensaje */}
          <Card>
            <CardTitle>
              <span>Contenido del Ticket</span>
            </CardTitle>

            <FormGroup>
              <label>
                <span>Título / Ocasión</span>
                <span className="counter">{title.length}/30 caracteres</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: ¡FELIZ CUMPLEAÑOS!, DEDICATORIA..."
                maxLength={30}
              />
            </FormGroup>

            <RowTwoCols>
              <FormGroup>
                <label>
                  <span>Para (Destinatario)</span>
                  <span className="counter">{recipient.length}/10 caracteres</span>
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Ej: Sofía, Mamá..."
                  maxLength={10}
                />
              </FormGroup>

              <FormGroup>
                <label>
                  <span>De (Remitente / Firma)</span>
                  <span className="counter">{sender.length}/10 caracteres</span>
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="Ej: Martín..."
                  maxLength={10}
                />
              </FormGroup>
            </RowTwoCols>

            <FormGroup>
              <label>
                <span>Mensaje / Dedicatoria</span>
                <span className="counter">{message.length}/120 caracteres</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribí aquí el mensaje o dedicatoria que el cliente te pidió..."
                maxLength={120}
                rows={3}
              />
            </FormGroup>

            {/* Opciones de Impresión (Visibles solo en Dev) */}
            {isDev && (
              <OptionsSection>
                <ToggleOption>
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                  />
                  <span>Incluir Logo Pixel</span>
                </ToggleOption>

                <ToggleOption>
                  <input
                    type="checkbox"
                    checked={includeFooter}
                    onChange={(e) => setIncludeFooter(e.target.checked)}
                  />
                  <span>Saludo de Cierre</span>
                </ToggleOption>

                <ToggleOption>
                  <input
                    type="checkbox"
                    checked={largeText}
                    onChange={(e) => setLargeText(e.target.checked)}
                  />
                  <span>Texto Grande</span>
                </ToggleOption>
              </OptionsSection>
            )}

            {/* Control de Copias y Botones */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                paddingTop: 8,
              }}
            >
              <CopiesControl>
                <span className="label">Copias:</span>
                <div className="stepper">
                  <button
                    type="button"
                    disabled={copies <= 1}
                    onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  >
                    −
                  </button>
                  <span className="value">{copies}</span>
                  <button
                    type="button"
                    disabled={copies >= 10}
                    onClick={() => setCopies((c) => Math.min(10, c + 1))}
                  >
                    +
                  </button>
                </div>
              </CopiesControl>

              <ButtonContainer style={{ margin: 0 }}>
                {hasContent && (
                  <ClearButton type="button" onClick={handleClear}>
                    Limpiar
                  </ClearButton>
                )}
                <PrintButton
                  type="button"
                  disabled={isPrinting || (!message.trim() && !recipient.trim())}
                  onClick={handlePrint}
                >
                  <Printer size={18} />
                  <span>{isPrinting ? 'Imprimiendo...' : copies > 1 ? `Imprimir ${copies} Tickets` : 'Imprimir Ticket'}</span>
                </PrintButton>
              </ButtonContainer>
            </div>
          </Card>

          {/* Historial Reciente */}
          {history.length > 0 && (
            <Card>
              <CardTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="#64748b" />
                  <span>Dedicatorias Recientes</span>
                </div>
                <button
                  type="button"
                  onClick={clearHistory}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Trash2 size={13} />
                  <span>Borrar historial</span>
                </button>
              </CardTitle>

              <HistoryContainer>
                {history.map((item) => (
                  <HistoryItem key={item.id}>
                    <div className="info">
                      <div className="top-line">
                        <span>{item.title || 'Nota'}</span>
                        {item.recipient && (
                          <span style={{ color: '#4d0012', fontWeight: 600 }}>• Para: {item.recipient}</span>
                        )}
                        <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 11, marginLeft: 'auto' }}>
                          {item.date}
                        </span>
                      </div>
                      <div className="msg-preview">"{item.message}"</div>
                    </div>
                    <div className="actions">
                      <button type="button" onClick={() => handleLoadHistory(item)}>
                        Cargar
                      </button>
                    </div>
                  </HistoryItem>
                ))}
              </HistoryContainer>
            </Card>
          )}
        </LeftColumn>

        {/* COLUMNA DERECHA: Vista Previa Realista en Vivo */}
        <RightColumn>
          <ThermalPreviewCard>
            <CardTitle style={{ width: '100%', marginBottom: 4 }}>
              <span>Vista Previa del Ticket</span>
              <span className="badge">58mm</span>
            </CardTitle>

            <OrientationSelector style={{ width: '100%' }}>
              <button
                type="button"
                className={orientation === 'vertical' ? 'active' : ''}
                onClick={() => setOrientation('vertical')}
              >
                ↕ Ticket Vertical
              </button>
              <button
                type="button"
                className={orientation === 'horizontal' ? 'active' : ''}
                onClick={() => setOrientation('horizontal')}
              >
                ↔ Faja Horizontal (90°)
              </button>
            </OrientationSelector>

            {orientation === 'vertical' ? (
              <ThermalPaper $largeText={largeText}>
                {includeLogo && (
                  <div className="ticket-logo">
                    <img src={logoBase64} alt="Pixel" />
                  </div>
                )}

                {trimmedTitle && (
                  <div
                    className="ticket-title font-card-title"
                    style={{
                      fontSize: isVeryLongSingleWord ? '11.5px' : isLongSingleWord ? '13px' : '14.5px',
                      letterSpacing: isVeryLongSingleWord ? '0.2px' : isLongSingleWord ? '0.4px' : '0.6px',
                    }}
                  >
                    <span className="title-heart" style={{ fontSize: isVeryLongSingleWord ? '10.5px' : '13px' }}>♥</span>
                    <span
                      className="title-text"
                      style={{
                        whiteSpace: isSingleWord ? 'nowrap' : 'normal',
                        wordBreak: isSingleWord ? 'normal' : 'break-word',
                      }}
                    >
                      {trimmedTitle}
                    </span>
                    <span className="title-heart" style={{ fontSize: isVeryLongSingleWord ? '10.5px' : '13px' }}>♥</span>
                  </div>
                )}

                {recipient.trim() && (
                  <div className="ticket-to">
                    <div className="to-label font-handwritten">Para:</div>
                    <div className="to-name font-card-name">{recipient.trim()} ♡</div>
                  </div>
                )}

                <div className="ticket-message-box">
                  <div className="ticket-message-text font-card-message">
                    {message.trim() || 'Escribí un mensaje para ver cómo queda en la dedicatoria...'}
                  </div>
                </div>

                {sender.trim() && (
                  <div className="ticket-from">
                    <span className="from-label font-handwritten">Atte:</span>
                    <span className="from-name font-card-name">{sender.trim()} ♥</span>
                  </div>
                )}

                {includeFooter && (
                  <div className="ticket-footer">
                    <div className="footer-highlight font-card-footer">♥ ¡Esperamos que lo disfrutes! ♥</div>
                  </div>
                )}
              </ThermalPaper>
            ) : (
              <ThermalRibbon $largeText={largeText}>
                <div className="ribbon-left">
                  {includeLogo && (
                    <div className="ribbon-logo">
                      <img src={logoBase64} alt="Pixel" />
                    </div>
                  )}
                  {trimmedTitle && (
                    <div
                      className="ribbon-title font-card-title"
                      style={{
                        fontSize: isVeryLongSingleWord ? '8.5px' : isLongSingleWord ? '9.5px' : '11px',
                        letterSpacing: isVeryLongSingleWord ? '0.1px' : isLongSingleWord ? '0.3px' : '0.6px',
                      }}
                    >
                      <span className="title-heart" style={{ fontSize: isVeryLongSingleWord ? '8px' : '10px' }}>♥</span>
                      <span
                        className="title-text"
                        style={{
                          whiteSpace: isSingleWord ? 'nowrap' : 'normal',
                          wordBreak: isSingleWord ? 'normal' : 'break-word',
                        }}
                      >
                        {trimmedTitle}
                      </span>
                      <span className="title-heart" style={{ fontSize: isVeryLongSingleWord ? '8px' : '10px' }}>♥</span>
                    </div>
                  )}
                </div>
                <div className="ribbon-body">
                  {(recipient.trim() || sender.trim()) && (
                    <div className="ribbon-header-row">
                      {recipient.trim() && (
                        <div className="ribbon-to">
                          <span className="to-label font-handwritten">Para:</span>
                          <span className="to-name font-card-name">{recipient.trim()} ♡</span>
                        </div>
                      )}
                      {sender.trim() && (
                        <div className="ribbon-from">
                          <span className="from-label font-handwritten">Atte:</span>
                          <span className="from-name font-card-name">{sender.trim()} ♥</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="ribbon-message-box">
                    <span className="ribbon-message-text font-card-message">
                      {message.trim() || 'Escribí un mensaje para ver cómo queda en la faja...'}
                    </span>
                  </div>

                  {includeFooter && (
                    <div className="ribbon-footer font-card-footer">
                      ♥ ¡Esperamos que lo disfrutes! ♥
                    </div>
                  )}
                </div>
              </ThermalRibbon>
            )}
          </ThermalPreviewCard>
        </RightColumn>
      </ContentGrid>
      </PageWrapper>

      {/* COMPONENTE IMPRIMIBLE REAL (Offscreen / Print) */}
      <HiddenPrintRoot>
        {orientation === 'vertical' ? (
          <div
            ref={printRef}
            className="ticket58"
            style={{
              width: '40mm',
              maxWidth: '40mm',
              boxSizing: 'border-box',
              margin: '0 auto',
              padding: '0 0 3mm 0',
              lineHeight: 1.25,
              fontSize: largeText ? '4mm' : '3.6mm',
              fontFamily: "'Playfair Display', 'Georgia', 'Cambria', 'Segoe UI', serif",
              color: '#000000',
              background: '#ffffff',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {includeLogo && (
              <div style={{ textAlign: 'center', marginBottom: '7mm', paddingTop: '2mm' }}>
                <img
                  src={logoBase64}
                  alt="Logo"
                  style={{
                    width: '26mm',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </div>
            )}

            {trimmedTitle && (
              <div
                className="font-card-title"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: '1.5mm',
                  fontSize: isVeryLongSingleWord ? '3.5mm' : isLongSingleWord ? '4mm' : '4.5mm',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: isVeryLongSingleWord ? '0.2px' : isLongSingleWord ? '0.4px' : '0.6px',
                  lineHeight: 1.2,
                  margin: '3mm 0 4.5mm',
                  padding: '1.4mm 0',
                  borderTop: '1.3px solid #000000',
                  borderBottom: '1.3px solid #000000',
                  fontFamily: "'Inter', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ flexShrink: 0, fontSize: isVeryLongSingleWord ? '3mm' : '3.8mm', lineHeight: 1.2 }}>♥</span>
                <span
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    wordBreak: isSingleWord ? 'normal' : 'break-word',
                    whiteSpace: isSingleWord ? 'nowrap' : 'normal',
                    lineHeight: 1.2,
                  }}
                >
                  {trimmedTitle}
                </span>
                <span style={{ flexShrink: 0, fontSize: isVeryLongSingleWord ? '3mm' : '3.8mm', lineHeight: 1.2 }}>♥</span>
              </div>
            )}

            {recipient.trim() && (
              <div
                style={{
                  textAlign: 'center',
                  margin: '3mm 0 3.5mm',
                }}
              >
                <div
                  className="font-handwritten"
                  style={{
                    fontSize: '3.6mm',
                    fontStyle: 'italic',
                    fontFamily: "'Caveat', 'Dancing Script', 'Segoe Script', 'Georgia', cursive",
                    color: '#333333',
                    marginBottom: '0.5mm',
                  }}
                >
                  Para:
                </div>
                <div
                  className="font-card-name"
                  style={{
                    fontSize: '4.2mm',
                    fontWeight: 900,
                    letterSpacing: '0.4px',
                    fontFamily: "'Playfair Display', 'Georgia', 'Arial Black', serif, sans-serif",
                    wordBreak: 'break-word',
                  }}
                >
                  {recipient.trim()} ♡
                </div>
              </div>
            )}

            <div
              style={{
                border: '1.5px solid #000000',
                borderRadius: '5px',
                padding: '3mm 2mm',
                margin: '4mm 0 2.5mm',
                textAlign: 'center',
                background: '#ffffff',
              }}
            >
              <div
                className="font-card-message"
                style={{
                  fontSize: largeText ? '4.2mm' : '3.6mm',
                  fontWeight: 600,
                  fontFamily: "'Lora', 'Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', serif",
                  fontStyle: 'italic',
                  lineHeight: 1.35,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  padding: '0 1mm',
                }}
              >
                {message.trim()}
              </div>
            </div>

            {sender.trim() && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'flex-end',
                  gap: '1.5mm',
                  marginTop: '4mm',
                  marginBottom: '4mm',
                  paddingRight: '1mm',
                  textAlign: 'right',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  className="font-handwritten"
                  style={{
                    fontSize: '3.6mm',
                    fontStyle: 'italic',
                    fontFamily: "'Caveat', 'Dancing Script', 'Segoe Script', 'Georgia', cursive",
                    color: '#444444',
                  }}
                >
                  Atte:
                </span>
                <span
                  className="font-card-name"
                  style={{
                    fontSize: '3.8mm',
                    fontWeight: 900,
                    fontFamily: "'Playfair Display', 'Georgia', 'Arial Black', serif, sans-serif",
                    wordBreak: 'break-word',
                  }}
                >
                  {sender.trim()} ♥
                </span>
              </div>
            )}

            {includeFooter && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '4.5mm',
                  paddingTop: '2.5mm',
                  borderTop: '1px dashed #000000',
                }}
              >
                <div
                  className="font-card-footer"
                  style={{
                    fontSize: '3mm',
                    fontWeight: 800,
                    letterSpacing: '0.4px',
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                  }}
                >
                  ♥ ¡Esperamos que lo disfrutes! ♥
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            ref={printRef}
            className="ticket58-rotated"
            style={{
              width: '40mm',
              maxWidth: '40mm',
              boxSizing: 'border-box',
              margin: 0,
              padding: 0,
              background: '#ffffff',
              color: '#000000',
              fontFamily: "'Playfair Display', 'Georgia', 'Cambria', 'Segoe UI', serif",
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <div
              style={{
                transformOrigin: 'top left',
                transform: 'rotate(90deg) translateY(-40mm)',
                width: '135mm',
                height: '40mm',
                boxSizing: 'border-box',
                padding: '1.5mm 3mm',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '2.5mm',
                fontFamily: "'Playfair Display', 'Georgia', 'Cambria', serif",
              }}
            >
              {/* Columna Izquierda: Logo y Título */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: '1.2px dashed #000000',
                  paddingRight: '2mm',
                  minWidth: '38mm',
                  maxWidth: '44mm',
                  textAlign: 'center',
                }}
              >
                {includeLogo && (
                  <img
                    src={logoBase64}
                    alt="Pixel"
                    style={{
                      width: '15mm',
                      maxWidth: '15mm',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                )}
                {trimmedTitle && (
                  <div
                    className="font-card-title"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      gap: '0.8mm',
                      fontSize: isVeryLongSingleWord ? '2.4mm' : isLongSingleWord ? '2.8mm' : '3.2mm',
                      fontWeight: 900,
                      marginTop: includeLogo ? '0.8mm' : '0',
                      textTransform: 'uppercase',
                      letterSpacing: isVeryLongSingleWord ? '0.1px' : isLongSingleWord ? '0.3px' : '0.6px',
                      lineHeight: 1.2,
                      borderTop: '1.2px solid #000000',
                      borderBottom: '1.2px solid #000000',
                      padding: '0.6mm 0.2mm',
                      fontFamily: "'Inter', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                      width: '100%',
                      maxWidth: '42mm',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ flexShrink: 0, fontSize: isVeryLongSingleWord ? '2.2mm' : '2.8mm', lineHeight: 1.2 }}>♥</span>
                    <span
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        wordBreak: isSingleWord ? 'normal' : 'break-word',
                        whiteSpace: isSingleWord ? 'nowrap' : 'normal',
                        lineHeight: 1.2,
                      }}
                    >
                      {trimmedTitle}
                    </span>
                    <span style={{ flexShrink: 0, fontSize: isVeryLongSingleWord ? '2.2mm' : '2.8mm', lineHeight: 1.2 }}>♥</span>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Para / Atte + Recuadro del Mensaje + Footer */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '1mm',
                }}
              >
                {/* Fila Superior: Para y Atte */}
                {(recipient.trim() || sender.trim()) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: '3mm',
                    }}
                  >
                    {recipient.trim() && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1mm', minWidth: 0 }}>
                        <span
                          className="font-handwritten"
                          style={{
                            fontSize: '3.2mm',
                            fontStyle: 'italic',
                            fontFamily: "'Caveat', 'Dancing Script', 'Segoe Script', cursive",
                            color: '#333333',
                            flexShrink: 0,
                          }}
                        >
                          Para:
                        </span>
                        <span
                          className="font-card-name"
                          style={{
                            fontSize: '3.5mm',
                            fontWeight: 900,
                            letterSpacing: '0.3px',
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {recipient.trim()} ♡
                        </span>
                      </div>
                    )}

                    {sender.trim() && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1mm', marginLeft: 'auto', minWidth: 0 }}>
                        <span
                          className="font-handwritten"
                          style={{
                            fontSize: '3mm',
                            fontStyle: 'italic',
                            fontFamily: "'Caveat', 'Dancing Script', 'Segoe Script', cursive",
                            color: '#444444',
                            flexShrink: 0,
                          }}
                        >
                          Atte:
                        </span>
                        <span
                          className="font-card-name"
                          style={{
                            fontSize: '3.3mm',
                            fontWeight: 900,
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {sender.trim()} ♥
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Recuadro de Mensaje Estilo Vertical sin comillas */}
                <div
                  style={{
                    border: '1.2px solid #000000',
                    borderRadius: '4px',
                    padding: '1.8mm 2.5mm',
                    background: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    className="font-card-message"
                    style={{
                      fontSize: largeText ? '3.5mm' : '3.1mm',
                      fontWeight: 600,
                      fontFamily: "'Lora', 'Playfair Display', 'Georgia', 'Cambria', serif",
                      fontStyle: 'italic',
                      lineHeight: 1.25,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      padding: '0 0.5mm',
                      width: '100%',
                    }}
                  >
                    {message.trim()}
                  </span>
                </div>

                {/* Footer de Cierre */}
                {includeFooter && (
                  <div
                    className="font-card-footer"
                    style={{
                      fontSize: '2.5mm',
                      fontWeight: 800,
                      letterSpacing: '0.3px',
                      textAlign: 'center',
                      paddingTop: '0.4mm',
                      marginTop: '0.3mm',
                      fontFamily: "'Playfair Display', 'Georgia', serif",
                    }}
                  >
                    ♥ ¡Esperamos que lo disfrutes! ♥
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </HiddenPrintRoot>
    </Container>
  );
}
