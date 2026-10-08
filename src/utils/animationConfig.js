// Configuración de animaciones para mejorar rendimiento en tablet Android

export const animationConfig = {
  // Reducir duración de animaciones en dispositivos móviles
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  
  // Easing functions optimizados
  easing: {
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOut: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
  },
  
  // Detectar dispositivos Android
  isAndroid: () => {
    return /Android/i.test(navigator.userAgent);
  },
  
  // Detectar tablet
  isTablet: () => {
    const userAgent = navigator.userAgent;
    const screenSize = Math.max(window.screen.width, window.screen.height);
    return /Tablet|iPad/i.test(userAgent) || (screenSize > 768 && /Android/i.test(userAgent));
  },
  
  // Obtener configuración optimizada según dispositivo
  getOptimizedConfig: () => {
    const isAndroid = animationConfig.isAndroid();
    const isTablet = animationConfig.isTablet();
    
    if (isAndroid && isTablet) {
      return {
        duration: animationConfig.duration.fast,
        easing: animationConfig.easing.easeOut,
        reducedMotion: false,
        useHardwareAcceleration: true,
      };
    }
    
    return {
      duration: animationConfig.duration.normal,
      easing: animationConfig.easing.easeInOut,
      reducedMotion: false,
      useHardwareAcceleration: true,
    };
  },
};

// Función para aplicar optimizaciones CSS a elementos animados
export const optimizeAnimation = (element) => {
  if (!element) return;
  
  element.style.willChange = 'transform, opacity';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
  element.style.transform = 'translate3d(0, 0, 0)';
  
  // Limpiar will-change después de la animación
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, 300);
};

// Configuración para framer-motion
export const motionConfig = {
  reducedMotion: {
    x: { duration: 0.1 },
    opacity: { duration: 0.1 },
    scale: { duration: 0.1 },
  },
  normalMotion: {
    x: { duration: 0.2, ease: 'easeOut' },
    opacity: { duration: 0.2, ease: 'easeOut' },
    scale: { duration: 0.2, ease: 'easeOut' },
  },
  tabletMotion: {
    x: { duration: 0.15, ease: 'easeOut' },
    opacity: { duration: 0.15, ease: 'easeOut' },
    scale: { duration: 0.15, ease: 'easeOut' },
  },
};