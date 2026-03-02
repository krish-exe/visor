use tauri::{
    AppHandle,
    Manager,
    PhysicalPosition,
    PhysicalSize,
    Window,
    Emitter,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

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

            if let Some(window) = app.get_webview_window("main") {
                // Disable native title bar and borders
                window.set_decorations(false).expect("Failed to disable decorations");

                // Disable resizing
                window.set_resizable(false).expect("Failed to set resizable");
                window.set_maximizable(false).expect("Failed to set maximizable");
                window.set_minimizable(false).expect("Failed to set minimizable");

                // Manually size to primary monitor (stable alternative to fullscreen)
                if let Ok(Some(monitor)) = window.primary_monitor() {
                    let size = monitor.size();
                    let position = monitor.position();

                    window
                        .set_size(PhysicalSize::new(size.width, size.height))
                        .expect("Failed to set window size");

                    window
                        .set_position(PhysicalPosition::new(position.x, position.y))
                        .expect("Failed to set window position");
                }

                // Register focus event listener to fix white strip artifact on Windows
                // When window regains focus, Windows may repaint non-client area
                // We must reassert borderless state to prevent this
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(focused) = event {
                        if *focused {
                            // Window gained focus - reassert borderless state
                            if let Err(e) = window_clone.set_decorations(false) {
                                eprintln!("Failed to reassert decorations on focus: {}", e);
                            } else {
                                println!("Focus regained - decorations reasserted");
                            }
                        }
                    }
                });
            }

            // Register global shortcut
            app_handle
                .global_shortcut()
                .on_shortcut("Alt+Space", move |app: &AppHandle<_>, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        let _ = app.emit("toggle-toolbar", ());
                    }
                })
                .expect("Failed to register global shortcut");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_window_clickthrough
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}