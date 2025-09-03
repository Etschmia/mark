# Theme System & Settings Test

This document helps you test the new **Theme System** and **Settings Modal** features.

## 🎨 Theme System Features

### Light & Dark Mode
The editor now supports complete theme switching:

- **Dark Mode** - The classic dark theme with slate colors
- **Light Mode** - Clean light theme with white background and dark text

### How to Switch Themes
1. Click the **help button** (❓) in the toolbar
2. Select **⚙️ Einstellungen** from the dropdown
3. Choose between **🌙 Dunkel** or **☀️ Hell** under "Editor-Theme"
4. Changes apply immediately!

## ⚙️ Settings Modal Features

### Appearance Settings
- **Editor Theme**: Light/Dark mode toggle
- **Preview Theme**: Choose from available preview themes
- **Font Size**: Adjustable from 10px to 24px using slider

### Editor Settings  
- **Line Numbers**: Toggle to show/hide line numbers
- **Font Size**: Real-time adjustment affects editor immediately

### Behavior Settings
- **Debounce Time**: Control how often undo entries are created (100-2000ms)
- **Auto-Save**: Toggle automatic saving to localStorage

## 🧪 Testing Instructions

### Theme Testing
1. **Switch to Light Mode**:
   - Open settings and select "Hell" theme
   - Notice the entire UI switches to light colors
   - Editor background becomes white
   - Toolbar and panels use light gray colors

2. **Switch to Dark Mode**:
   - Select "Dunkel" theme  
   - UI returns to dark slate colors
   - Editor uses dark background with light text

### Font Size Testing
1. **Adjust Font Size**:
   - Use the slider in settings (10-24px)
   - See immediate changes in editor text
   - Test readability at different sizes

### Debounce Testing
1. **Change Debounce Time**:
   - Set to 100ms for frequent undo entries
   - Set to 2000ms for less frequent entries
   - Type quickly and test undo behavior

### Auto-Save Testing
1. **Disable Auto-Save**:
   - Turn off auto-save in settings
   - Type content and refresh page
   - Content should not persist

2. **Enable Auto-Save**:
   - Turn on auto-save
   - Type content and refresh page
   - Content should be restored

## 🎯 Features to Verify

### Theme Consistency
- [ ] Toolbar matches selected theme
- [ ] Editor background matches theme
- [ ] Search panel matches theme
- [ ] Settings modal matches theme
- [ ] Separator and borders match theme

### Settings Persistence
- [ ] Theme choice saved after page reload
- [ ] Font size preserved between sessions
- [ ] Debounce time setting remembered
- [ ] Auto-save preference stored
- [ ] Preview theme selection persists

### Immediate Application
- [ ] Theme changes apply without reload
- [ ] Font size changes visible immediately
- [ ] Line numbers toggle works instantly
- [ ] Settings modal reflects current values

## 💡 Advanced Testing

### Edge Cases
- Try switching themes multiple times rapidly
- Test with very small (10px) and large (24px) fonts
- Verify settings work with different preview themes
- Test auto-save with large documents

### Integration Testing
- Use keyboard shortcuts in both themes
- Test export functionality in light mode
- Verify help system works in both themes
- Check search panel styling in light mode

## 🔄 Reset Testing
1. Click "Zurücksetzen" in settings modal
2. Verify all settings return to defaults:
   - Theme: Dark
   - Font Size: 14px
   - Debounce: 500ms
   - Auto-Save: Enabled
   - Line Numbers: Disabled

The theme system provides a complete visual transformation of the entire application, making it comfortable to use in any lighting condition!