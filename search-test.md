# Search and Replace Functionality Test

This document contains various text patterns to test the **search and replace** functionality.

## How to Use Search and Replace

1. **Toolbar Button**: Click the search icon (🔍) in the toolbar
2. **Keyboard Shortcut**: Press `Ctrl+F` (Windows/Linux) or `Cmd+F` (Mac)
3. **Search Panel**: Enter your search term in the search box
4. **Replace**: Enter replacement text and use replace buttons
5. **Navigation**: Use arrow buttons to navigate between matches

## Features Available

### Search Options
- **Case-sensitive search**: Toggle case sensitivity
- **Regular expressions**: Use regex patterns for advanced search
- **Whole word matching**: Match complete words only

### Replace Options
- **Replace single**: Replace current match
- **Replace all**: Replace all matches at once
- **Replace and find**: Replace current and move to next

## Test Content

Here are some sample patterns to search for:

- **test** appears multiple times in this document
- **Search** with different cases: search, Search, SEARCH
- **Numbers**: 123, 456, 789
- **Email patterns**: user@example.com, admin@test.org
- **Common words**: the, and, or, but, for, with, this, that

### Code Examples

```javascript
function searchExample() {
  const searchTerm = "test";
  const text = "This is a test string with test words";
  return text.includes(searchTerm);
}
```

```python
def search_function(text, pattern):
    """Search for pattern in text"""
    import re
    return re.findall(pattern, text)
```

### Repetitive Content for Testing

This is a test line. This is another test line.
The word "test" appears frequently for testing purposes.
Search functionality should highlight all instances of "test".

## Regular Expression Examples

Try searching with these regex patterns:

- `\d+` (matches any number)
- `\b[A-Z][a-z]+\b` (matches capitalized words)
- `\w+@\w+\.\w+` (matches basic email patterns)
- `test|search|replace` (matches any of these words)

**Note**: Make sure to enable regex mode in the search panel when using these patterns.

This document provides plenty of content to test the search and replace functionality thoroughly!