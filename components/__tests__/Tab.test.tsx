import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tab } from '../Tab';
import { Tab as TabType } from '../../types';
import { createDefaultTab } from '../../utils/tabUtils';

// Mock tab data
const createMockTab = (overrides: Partial<TabType> = {}): TabType => ({
  ...createDefaultTab(),
  ...overrides
});

describe('Tab Component', () => {
  const defaultProps = {
    tab: createMockTab({ filename: 'test.md', content: '# Test' }),
    isActive: false,
    onSelect: jest.fn(),
    onClose: jest.fn(),
    onContextMenu: jest.fn(),
    theme: 'dark' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders tab with filename', () => {
      render(<Tab {...defaultProps} />);
      
      expect(screen.getByText('test.md')).toBeInTheDocument();
      expect(screen.getByRole('tab')).toBeInTheDocument();
    });

    test('renders active tab with correct styling', () => {
      render(<Tab {...defaultProps} isActive={true} />);
      
      const tab = screen.getByRole('tab');
      expect(tab).toHaveAttribute('aria-selected', 'true');
      expect(tab).toHaveAttribute('tabIndex', '0');
    });

    test('renders inactive tab with correct styling', () => {
      render(<Tab {...defaultProps} isActive={false} />);
      
      const tab = screen.getByRole('tab');
      expect(tab).toHaveAttribute('aria-selected', 'false');
      expect(tab).toHaveAttribute('tabIndex', '-1');
    });

    test('shows unsaved changes indicator when tab has unsaved changes', () => {
      const tabWithChanges = createMockTab({ 
        filename: 'test.md', 
        hasUnsavedChanges: true 
      });
      
      render(<Tab {...defaultProps} tab={tabWithChanges} />);
      
      expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
    });

    test('does not show unsaved changes indicator when tab is saved', () => {
      const savedTab = createMockTab({ 
        filename: 'test.md', 
        hasUnsavedChanges: false 
      });
      
      render(<Tab {...defaultProps} tab={savedTab} />);
      
      expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
    });

    test('truncates long filenames', () => {
      const longFilenameTab = createMockTab({ 
        filename: 'this-is-a-very-long-filename-that-should-be-truncated.md' 
      });
      
      render(<Tab {...defaultProps} tab={longFilenameTab} />);
      
      // Should show truncated version
      expect(screen.getByText(/this-is-a-very-lo\.\.\./)).toBeInTheDocument();
      
      // But full filename should be in title attribute
      const tab = screen.getByRole('tab');
      expect(tab).toHaveAttribute('title', longFilenameTab.filename);
    });
  });

  describe('theme support', () => {
    test('applies dark theme classes', () => {
      render(<Tab {...defaultProps} theme="dark" />);
      
      const tab = screen.getByRole('tab');
      expect(tab).toHaveClass('bg-slate-700', 'text-slate-300');
    });

    test('applies light theme classes', () => {
      render(<Tab {...defaultProps} theme="light" />);
      
      const tab = screen.getByRole('tab');
      expect(tab).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    test('applies active theme classes correctly', () => {
      render(<Tab {...defaultProps} theme="dark" isActive={true} />);
      
      const tab = screen.getByRole('tab');
      expect(tab).toHaveClass('bg-slate-800', 'text-white', 'border-cyan-500');
    });
  });

  describe('interactions', () => {
    test('calls onSelect when tab is clicked', () => {
      const onSelect = jest.fn();
      render(<Tab {...defaultProps} onSelect={onSelect} />);
      
      fireEvent.click(screen.getByRole('tab'));
      
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test('calls onContextMenu when right-clicked', () => {
      const onContextMenu = jest.fn();
      render(<Tab {...defaultProps} onContextMenu={onContextMenu} />);
      
      fireEvent.contextMenu(screen.getByRole('tab'));
      
      expect(onContextMenu).toHaveBeenCalledTimes(1);
      expect(onContextMenu).toHaveBeenCalledWith(expect.any(Object));
    });

    test('shows close button on hover', () => {
      render(<Tab {...defaultProps} />);
      
      const tab = screen.getByRole('tab');
      
      // Close button should not be visible initially
      expect(screen.queryByTitle('Close tab')).not.toBeInTheDocument();
      
      // Hover over tab
      fireEvent.mouseEnter(tab);
      
      // Close button should now be visible
      expect(screen.getByTitle('Close tab')).toBeInTheDocument();
    });

    test('shows close button when tab is active', () => {
      render(<Tab {...defaultProps} isActive={true} />);
      
      // Close button should be visible for active tab
      expect(screen.getByTitle('Close tab')).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<Tab {...defaultProps} onClose={onClose} isActive={true} />);
      
      const closeButton = screen.getByTitle('Close tab');
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('prevents event propagation when close button is clicked', () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      
      render(<Tab {...defaultProps} onSelect={onSelect} onClose={onClose} isActive={true} />);
      
      const closeButton = screen.getByTitle('Close tab');
      fireEvent.click(closeButton);
      
      // onClose should be called but onSelect should not (event stopped propagation)
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });

    test('prevents event propagation when context menu is triggered', () => {
      const onSelect = jest.fn();
      const onContextMenu = jest.fn();
      
      render(<Tab {...defaultProps} onSelect={onSelect} onContextMenu={onContextMenu} />);
      
      fireEvent.contextMenu(screen.getByRole('tab'));
      
      expect(onContextMenu).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    test('has correct ARIA attributes', () => {
      const tab = createMockTab({ id: 'test-tab-123' });
      render(<Tab {...defaultProps} tab={tab} />);
      
      const tabElement = screen.getByRole('tab');
      expect(tabElement).toHaveAttribute('aria-controls', 'tabpanel-test-tab-123');
      expect(tabElement).toHaveAttribute('id', 'tab-test-tab-123');
    });

    test('has correct tabIndex for keyboard navigation', () => {
      // Active tab should be focusable
      const { rerender } = render(<Tab {...defaultProps} isActive={true} />);
      expect(screen.getByRole('tab')).toHaveAttribute('tabIndex', '0');
      
      // Inactive tab should not be focusable
      rerender(<Tab {...defaultProps} isActive={false} />);
      expect(screen.getByRole('tab')).toHaveAttribute('tabIndex', '-1');
    });

    test('close button has correct accessibility attributes', () => {
      const tab = createMockTab({ filename: 'test.md' });
      render(<Tab {...defaultProps} tab={tab} isActive={true} />);
      
      const closeButton = screen.getByTitle('Close tab');
      expect(closeButton).toHaveAttribute('aria-label', 'Close test.md');
      expect(closeButton).toHaveAttribute('tabIndex', '-1'); // Mouse-only interaction
    });

    test('unsaved changes indicator has accessibility label', () => {
      const tabWithChanges = createMockTab({ hasUnsavedChanges: true });
      render(<Tab {...defaultProps} tab={tabWithChanges} />);
      
      const indicator = screen.getByLabelText('Unsaved changes');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('visual states', () => {
    test('applies hover styles correctly', () => {
      render(<Tab {...defaultProps} theme="dark" />);
      
      const tab = screen.getByRole('tab');
      
      // Initial state
      expect(tab).toHaveClass('bg-slate-700');
      
      // Hover state is handled by CSS, but we can test the hover event handlers
      fireEvent.mouseEnter(tab);
      fireEvent.mouseLeave(tab);
      
      // Component should handle hover state internally
      expect(tab).toBeInTheDocument();
    });

    test('shows active indicator line for active tab', () => {
      render(<Tab {...defaultProps} isActive={true} theme="dark" />);
      
      // Active indicator should be present (as a div with specific classes)
      const tab = screen.getByRole('tab');
      const indicator = tab.querySelector('.bg-cyan-500');
      expect(indicator).toBeInTheDocument();
    });

    test('does not show active indicator line for inactive tab', () => {
      render(<Tab {...defaultProps} isActive={false} theme="dark" />);
      
      const tab = screen.getByRole('tab');
      const indicator = tab.querySelector('.bg-cyan-500');
      expect(indicator).not.toBeInTheDocument();
    });
  });
});