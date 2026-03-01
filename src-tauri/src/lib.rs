use tauri::{Manager, AppHandle, PhysicalPosition, PhysicalSize, Emitter, Window};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[tauri::command]
fn setup_fullscreen_overlay(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        // Get primary monitor
        if let Ok(Some(monitor)) = window.primary_monitor() {
            let monitor_size = monitor.size();
            let monitor_position = monitor.position();
            
            // Set window to fullscreen size
            window.set_size(PhysicalSize::new(monitor_size.width, monitor_size.height))
                .map_err(|e| e.to_string())?;
            
            // Position at monitor origin
            window.set_position(PhysicalPosition::new(monitor_position.x, monitor_position.y))
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
fn set_window_clickthrough(window: Window, ignore: bool) -> Result<(), String> {
    window
        .set_ignore_cursor_events(ignore)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let app_handle = app.handle();

            // Register Alt+Space global shortcut
            app_handle
                .global_shortcut()
                .on_shortcut("Alt+Space", move |app: &AppHandle<_>, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        // Emit event to frontend to toggle toolbar
                        if let Err(e) = app.emit("toggle-toolbar", ()) {
                            eprintln!("Failed to emit toggle-toolbar event: {}", e);
                        } else {
                            println!("Alt+Space pressed - emitted toggle-toolbar event");
                        }
                    }
                })
                .expect("Failed to register global shortcut");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            setup_fullscreen_overlay,
            set_window_clickthrough
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}