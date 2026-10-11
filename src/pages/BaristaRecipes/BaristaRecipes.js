// src/pages/BaristaRecipes/BaristaRecipes.js
import React from 'react';
import styled from 'styled-components';
import BaristaRecipesCatalog from '../../components/Orders/BaristaRecipesCatalog';

const PageWrapper = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 12px 14px 32px;

  @media (max-width: 640px) {
    padding: 8px 6px 24px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
  }
`;

export default function BaristaRecipes() {
  return (
    <PageWrapper>
      <BaristaRecipesCatalog />
    </PageWrapper>
  );
}
