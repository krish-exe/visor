// Use tauri v2 imports
use tauri::{
    AppHandle,
    Manager,
    Window,
    Emitter,
    WebviewWindow,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
use screenshots::Screen;
use image::{ImageBuffer, RgbaImage};
use base64::{Engine as _, engine::general_purpose};

#[cfg(target_os = "windows")]
use windows::Win32::{
    Foundation::{HWND, LPARAM, LRESULT, WPARAM},
    UI::WindowsAndMessaging::{
        SetWindowLongPtrW,
        SetWindowPos,
        CallWindowProcW,
        DefWindowProcW,
        GWL_WNDPROC,
        GWL_STYLE,         // Added for style override
        WS_POPUP,          // Added for borderless popup style
        WM_NCHITTEST,
        HTCLIENT,
        SWP_NOZORDER,
        SWP_NOACTIVATE,
        SWP_SHOWWINDOW,
        SWP_FRAMECHANGED,  // Added to force recalculate client area
        WNDPROC,
    },
};

// ================= WINDOWS HIT TEST & STYLE OVERRIDE =================

#[cfg(target_os = "windows")]
static mut ORIGINAL_WNDPROC: Option<WNDPROC> = None;

#[cfg(target_os = "windows")]
unsafe extern "system" fn subclass_proc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    if msg == WM_NCHITTEST {
        return LRESULT(HTCLIENT as isize);
    }

    if let Some(orig) = ORIGINAL_WNDPROC {
        return CallWindowProcW(orig, hwnd, msg, wparam, lparam);
    }

    DefWindowProcW(hwnd, msg, wparam, lparam)
}

#[cfg(target_os = "windows")]
fn install_hit_test_override(window: &WebviewWindow) -> Result<(), String> {
    use std::ffi::c_void;

    let hwnd = window.hwnd().map_err(|e| e.to_string())?;
    let hwnd = HWND(hwnd.0 as *mut c_void);

    unsafe {
        let prev_proc = SetWindowLongPtrW(
            hwnd,
            GWL_WNDPROC,
            subclass_proc as *const () as isize,
        );

        ORIGINAL_WNDPROC = Some(std::mem::transmute(prev_proc));
    }

    Ok(())
}

#[cfg(target_os = "windows")]
fn force_full_monitor_bounds(window: &WebviewWindow) -> Result<(), String> {
    use std::ffi::c_void;

    let hwnd = window.hwnd().map_err(|e| e.to_string())?;
    let hwnd = HWND(hwnd.0 as *mut c_void);

    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No monitor found")?;

    let size = monitor.size();
    let position = monitor.position();

    unsafe {
        // 1. Strip all window borders by forcing WS_POPUP style
        SetWindowLongPtrW(hwnd, GWL_STYLE, WS_POPUP.0 as isize);

        // 2. Resize and include SWP_FRAMECHANGED to force Windows to apply the new borderless style
        SetWindowPos(
            hwnd,
            HWND(std::ptr::null_mut()),
            position.x,
            position.y,
            size.width as i32,
            size.height as i32,
            SWP_NOZORDER | SWP_NOACTIVATE | SWP_SHOWWINDOW | SWP_FRAMECHANGED,
        )
        .map_err(|e| format!("SetWindowPos failed: {:?}", e))?;
    }

    Ok(())
}

// ================= SCREEN CAPTURE =================

#[tauri::command]
fn capture_region(x: i32, y: i32, width: u32, height: u32) -> Result<String, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;
    // Target the primary screen or the screen where the window resides
    let screen = &screens[0];

    let image = screen.capture().map_err(|e| e.to_string())?;

    let img_buffer: RgbaImage =
        ImageBuffer::from_vec(image.width(), image.height(), image.into_raw())
            .ok_or("Failed to create image buffer")?;

    let cropped = image::imageops::crop_imm(&img_buffer, x as u32, y as u32, width, height);

    let mut png_bytes = Vec::new();
    cropped
        .to_image()
        .write_to(&mut std::io::Cursor::new(&mut png_bytes), image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;

    Ok(general_purpose::STANDARD.encode(&png_bytes))
}

// ================= WINDOW COMMANDS =================

#[tauri::command]
fn set_window_clickthrough(window: Window, ignore: bool) -> Result<(), String> {
    window.set_ignore_cursor_events(ignore).map_err(|e| e.to_string())
}

#[tauri::command]
fn exit_app(app: AppHandle) {
    app.exit(0);
}

// ================= MAIN RUN =================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let app_handle = app.handle();

            if let Some(window) = app.get_webview_window("main") {
                // Standard Tauri window setup
                window.set_decorations(false).unwrap();
                window.set_resizable(false).unwrap();
                window.set_shadow(false).unwrap(); // Crucial for Windows 10/11 gaps

                #[cfg(target_os = "windows")]
                {
                    // Advanced Win32 overrides to eliminate "invisible" resize borders
                    install_hit_test_override(&window).unwrap();
                    force_full_monitor_bounds(&window).unwrap();
                }
            }

            // Global Shortcut Example
            app_handle
                .global_shortcut()
                .on_shortcut("Alt+Space", move |app: &AppHandle<_>, _, event| {
                    if event.state == ShortcutState::Pressed {
                        let _ = app.emit("toggle-toolbar", ());
                    }
                })
                .unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_window_clickthrough,
            capture_region,
            exit_app
        ])
        .run(tauri::generate_context!())
        .expect("error running app");
}