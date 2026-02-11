mod menu;

use std::env;
use std::path::PathBuf;
use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // Collect CLI arguments (skip binary name)
  let raw_args: Vec<String> = env::args().skip(1).collect();
  let cwd = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

  // Resolve each argument to an absolute path
  let resolved: Vec<String> = raw_args
    .iter()
    .filter(|a| !a.starts_with('-')) // skip flags
    .map(|arg| {
      let p = PathBuf::from(arg);
      if p.is_absolute() {
        p
      } else {
        cwd.join(p)
      }
      .canonicalize()
      .unwrap_or_else(|_| {
        let joined = if PathBuf::from(arg).is_absolute() {
          PathBuf::from(arg)
        } else {
          cwd.join(arg)
        };
        joined
      })
    })
    .map(|p| p.to_string_lossy().into_owned())
    .collect();

  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .setup(move |app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Build and set native menu bar
      let app_menu = menu::build_menu(app.handle())?;
      app.set_menu(app_menu)?;

      // Forward custom menu events to the frontend
      app.on_menu_event(|handle, event| {
        let _ = handle.emit("menu-action", event.id().as_ref());
      });

      // Inject resolved CLI args into the webview
      if !resolved.is_empty() {
        let json = serde_json::to_string(&resolved)
          .unwrap_or_else(|_| "[]".to_string());

        if let Some(window) = app.get_webview_window("main") {
          let _ = window.eval(&format!("window.__MARK_ARGS__ = {};", json));
        }
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
