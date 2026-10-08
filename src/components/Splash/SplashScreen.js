import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

import logo from '../../assets/logoprintwhite.png';

const SplashContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #4d0012; /* Bordo */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Logo = styled(motion.img)`
  width: 180px;
  height: auto;
  margin-bottom: 80px; /* Optical centering */
  /* Filter to make white png look beige/gold-ish */
  /* sepia: gives it a brownish tone. saturate/hue-rotate: adjust to beige */
  filter: sepia(100%) saturate(200%) brightness(120%) hue-rotate(5deg);
  
  @media (pointer: coarse) {
    width: 220px;
  }
`;

const SplashScreen = () => {
    return (
        <SplashContainer
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Logo
                src={logo}
                alt="Pixel POS"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />
        </SplashContainer>
    );
};

export default SplashScreen;
