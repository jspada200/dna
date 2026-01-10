import { describe, it, expect } from 'vitest';
import { render, screen } from './test/render';
import App from './App';

describe('App', () => {
  it('should render the app', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('should render the layout', () => {
    render(<App />);
    expect(document.querySelector('aside')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeInTheDocument();
  });
});
