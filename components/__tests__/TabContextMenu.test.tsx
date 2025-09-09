import React from 'react';
import { TabContextMenu } from '../TabContextMenu';
import type { TabContextMenuProps } from '../../types';

// Mock props for testing
const mockProps: TabContextMenuProps = {
  isOpen: true,
  position: { x: 100, y: 100 },
  tabId: 'test-tab-1',
  onClose: jest.fn(),
  onCloseTab: jest.fn(),
  onCloseOtherTabs: jest.fn(),
  onCloseAllTabs: jest.fn(),
  onDuplicateTab: jest.fn(),
};

describe('TabContextMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders context menu when isOpen is true', () => {
    const { container } = render(<TabContextMenu {...mockProps} />);
    expect(container.querySelector('[role="menu"]')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(<TabContextMenu {...mockProps} isOpen={false} />);
    expect(container.querySelector('[role="menu"]')).not.toBeInTheDocument();
  });

  test('renders all menu items', () => {
    render(<TabContextMenu {...mockProps} />);
    
    expect(screen.getByText('Duplicate Tab')).toBeInTheDocument();
    expect(screen.getByText('Close Tab')).toBeInTheDocument();
    expect(screen.getByText('Close Other Tabs')).toBeInTheDocument();
    expect(screen.getByText('Close All Tabs')).toBeInTheDocument();
  });

  test('calls onDuplicateTab when Duplicate Tab is clicked', () => {
    render(<TabContextMenu {...mockProps} />);
    
    fireEvent.click(screen.getByText('Duplicate Tab'));
    expect(mockProps.onDuplicateTab).toHaveBeenCalledWith('test-tab-1');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('calls onCloseTab when Close Tab is clicked', () => {
    render(<TabContextMenu {...mockProps} />);
    
    fireEvent.click(screen.getByText('Close Tab'));
    expect(mockProps.onCloseTab).toHaveBeenCalledWith('test-tab-1');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('calls onCloseOtherTabs when Close Other Tabs is clicked', () => {
    render(<TabContextMenu {...mockProps} />);
    
    fireEvent.click(screen.getByText('Close Other Tabs'));
    expect(mockProps.onCloseOtherTabs).toHaveBeenCalledWith('test-tab-1');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('calls onCloseAllTabs when Close All Tabs is clicked', () => {
    render(<TabContextMenu {...mockProps} />);
    
    fireEvent.click(screen.getByText('Close All Tabs'));
    expect(mockProps.onCloseAllTabs).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('calls onClose when Escape key is pressed', () => {
    render(<TabContextMenu {...mockProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('positions menu correctly', () => {
    const { container } = render(<TabContextMenu {...mockProps} position={{ x: 200, y: 300 }} />);
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    
    expect(menu.style.left).toBe('200px');
    expect(menu.style.top).toBe('300px');
  });

  test('adjusts position when menu would go outside viewport', () => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 300, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 400, writable: true });
    
    const { container } = render(<TabContextMenu {...mockProps} position={{ x: 250, y: 350 }} />);
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    
    // Menu should be repositioned to stay within viewport
    expect(parseInt(menu.style.left)).toBeLessThan(250);
    expect(parseInt(menu.style.top)).toBeLessThan(350);
  });

  test('supports keyboard navigation', () => {
    render(<TabContextMenu {...mockProps} />);
    
    const menuItems = screen.getAllByRole('menuitem');
    
    // Focus first item initially
    expect(document.activeElement).toBe(menuItems[0]);
    
    // Arrow down should move to next item
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItems[1]);
    
    // Arrow up should move to previous item
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(menuItems[0]);
  });

  test('activates menu item with Enter key', () => {
    render(<TabContextMenu {...mockProps} />);
    
    const duplicateButton = screen.getByText('Duplicate Tab');
    duplicateButton.focus();
    
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(mockProps.onDuplicateTab).toHaveBeenCalledWith('test-tab-1');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('activates menu item with Space key', () => {
    render(<TabContextMenu {...mockProps} />);
    
    const closeButton = screen.getByText('Close Tab');
    closeButton.focus();
    
    fireEvent.keyDown(document, { key: ' ' });
    expect(mockProps.onCloseTab).toHaveBeenCalledWith('test-tab-1');
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});