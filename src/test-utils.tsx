import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import '@testing-library/jest-dom';

// Rozszerzony renderer z dodatkowymi opcjami
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// re-eksport wszystkich metod z @testing-library/react
export * from '@testing-library/react';
// zastępujemy metodę render naszą własną
export { customRender as render }; 