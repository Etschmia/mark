use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Wry,
};

/// Build the native application menu bar.
pub fn build_menu(handle: &AppHandle<Wry>) -> tauri::Result<Menu<Wry>> {
    // ── Datei ──
    let file_menu = Submenu::with_items(
        handle,
        "Datei",
        true,
        &[
            &MenuItem::with_id(handle, "new_file", "Neue Datei", true, Some("CmdOrCtrl+N"))?,
            &MenuItem::with_id(handle, "open_file", "Öffnen...", true, Some("CmdOrCtrl+O"))?,
            &MenuItem::with_id(
                handle,
                "open_folder",
                "Ordner öffnen...",
                true,
                Some("CmdOrCtrl+Shift+O"),
            )?,
            &PredefinedMenuItem::separator(handle)?,
            &MenuItem::with_id(handle, "save", "Speichern", true, Some("CmdOrCtrl+S"))?,
            &MenuItem::with_id(
                handle,
                "save_as",
                "Speichern unter...",
                true,
                Some("CmdOrCtrl+Shift+S"),
            )?,
            &PredefinedMenuItem::separator(handle)?,
            &MenuItem::with_id(handle, "close_tab", "Tab schließen", true, Some("CmdOrCtrl+W"))?,
            &PredefinedMenuItem::separator(handle)?,
            &PredefinedMenuItem::quit(handle, Some("Beenden"))?,
        ],
    )?;

    // ── Bearbeiten ──
    let edit_menu = Submenu::with_items(
        handle,
        "Bearbeiten",
        true,
        &[
            &PredefinedMenuItem::undo(handle, Some("Rückgängig"))?,
            &PredefinedMenuItem::redo(handle, Some("Wiederherstellen"))?,
            &PredefinedMenuItem::separator(handle)?,
            &PredefinedMenuItem::cut(handle, Some("Ausschneiden"))?,
            &PredefinedMenuItem::copy(handle, Some("Kopieren"))?,
            &PredefinedMenuItem::paste(handle, Some("Einfügen"))?,
            &PredefinedMenuItem::select_all(handle, Some("Alles auswählen"))?,
            &PredefinedMenuItem::separator(handle)?,
            &MenuItem::with_id(handle, "find", "Suchen", true, Some("CmdOrCtrl+F"))?,
        ],
    )?;

    // ── Ansicht ──
    let view_menu = Submenu::with_items(
        handle,
        "Ansicht",
        true,
        &[
            &MenuItem::with_id(
                handle,
                "toggle_preview",
                "Vorschau ein/aus",
                true,
                Some("CmdOrCtrl+P"),
            )?,
            &MenuItem::with_id(
                handle,
                "toggle_linter",
                "Linter ein/aus",
                true,
                Some("CmdOrCtrl+L"),
            )?,
            &PredefinedMenuItem::separator(handle)?,
            &MenuItem::with_id(
                handle,
                "toggle_sidebar",
                "Sidebar ein/aus",
                true,
                Some("CmdOrCtrl+B"),
            )?,
            &PredefinedMenuItem::separator(handle)?,
            &MenuItem::with_id(
                handle,
                "toggle_fullscreen",
                "Vollbild",
                true,
                Some("F11"),
            )?,
        ],
    )?;

    // ── Hilfe ──
    let help_menu = Submenu::with_items(
        handle,
        "Hilfe",
        true,
        &[
            &MenuItem::with_id(handle, "shortcuts", "Tastenkürzel", true, Some("CmdOrCtrl+/"))?,
            &MenuItem::with_id(handle, "cheatsheet", "Markdown Cheatsheet", true, None::<&str>)?,
            &PredefinedMenuItem::separator(handle)?,
            &MenuItem::with_id(handle, "about", "Über Mark", true, None::<&str>)?,
        ],
    )?;

    Menu::with_items(handle, &[&file_menu, &edit_menu, &view_menu, &help_menu])
}
