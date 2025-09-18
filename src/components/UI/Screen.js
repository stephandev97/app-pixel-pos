import styled from "styled-components";
import { motion } from "framer-motion";

export const Screen = styled(motion.div)`
  /* Este wrapper simula tu página base */
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;    /* importante para scroll interno */
  height: 100%;     /* ocupa todo el alto disponible */
  width: 100%;
  background: #fff; /* evita “transparencias” */
`;