use tauri::{
    AppHandle,
    Manager,
    Window,
    Emitter,
    WebviewWindow,
    WebviewUrl,
    WebviewWindowBuilder,
};

use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
use screenshots::Screen;
use image::{ImageBuffer, RgbaImage};
use base64::{Engine as _, engine::general_purpose};

mod ai;
mod commands;

use commands::ai_commands::stream_ai;

#[cfg(target_os = "windows")]
use windows::Win32::{
    Foundation::{HWND, LPARAM, LRESULT, WPARAM},
    UI::WindowsAndMessaging::{
        SetWindowLongPtrW,
        SetWindowPos,
        CallWindowProcW,
        DefWindowProcW,
        GWL_WNDPROC,
        GWL_STYLE,
        WS_POPUP,
        WM_NCHITTEST,
        HTTRANSPARENT,
        SWP_NOZORDER,
        SWP_NOACTIVATE,
        SWP_SHOWWINDOW,
        SWP_FRAMECHANGED,
        WNDPROC,
    },
};

#[cfg(target_os = "windows")]
static mut ORIGINAL_WNDPROC: Option<WNDPROC> = None;

#[cfg(target_os = "windows")]
unsafe extern "system" fn subclass_proc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM
) -> LRESULT {

    // Only the overlay window should pass clicks through
    if msg == WM_NCHITTEST {
        return LRESULT(HTTRANSPARENT as isize);
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
        let prev = SetWindowLongPtrW(hwnd, GWL_WNDPROC, subclass_proc as *const () as isize);
        ORIGINAL_WNDPROC = Some(std::mem::transmute(prev));
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
    let pos = monitor.position();

    unsafe {

        SetWindowLongPtrW(hwnd, GWL_STYLE, WS_POPUP.0 as isize);

        SetWindowPos(
            hwnd,
            HWND(std::ptr::null_mut()),
            pos.x,
            pos.y,
            size.width as i32,
            size.height as i32,
            SWP_NOZORDER | SWP_NOACTIVATE | SWP_SHOWWINDOW | SWP_FRAMECHANGED
        )
        .map_err(|e| format!("SetWindowPos failed: {:?}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn capture_region(x: i32, y: i32, width: u32, height: u32) -> Result<String, String> {

    let screens = Screen::all().map_err(|e| e.to_string())?;
    let screen = &screens[0];

    let image = screen.capture().map_err(|e| e.to_string())?;

    let buffer: RgbaImage = ImageBuffer::from_vec(
        image.width(),
        image.height(),
        image.into_raw()
    )
    .ok_or("Failed to create image buffer")?;

    let cropped = image::imageops::crop_imm(
        &buffer,
        x as u32,
        y as u32,
        width,
        height
    );

    let mut png_bytes = Vec::new();

    cropped
        .to_image()
        .write_to(
            &mut std::io::Cursor::new(&mut png_bytes),
            image::ImageFormat::Png
        )
        .map_err(|e| e.to_string())?;

    Ok(general_purpose::STANDARD.encode(&png_bytes))
}

#[tauri::command]
async fn create_chat_window(
    app: AppHandle,
    chat_id: String
) -> Result<(), String> {

    let label = format!("chat-{}", chat_id);

    if app.get_webview_window(&label).is_some() {
        return Ok(());
    }

    let window = WebviewWindowBuilder::new(
        &app,
        &label,
        WebviewUrl::App(format!("index.html?type=chat&id={}", chat_id).into())
    )
    .title("Visor AI Chat")
    .inner_size(500.0, 600.0)
    .decorations(false)
    .transparent(true)
    .shadow(false)
    .skip_taskbar(true)
    .resizable(true)
    .always_on_top(true)
    .visible(true)
    .build()
    .map_err(|e| e.to_string())?;

    // Chat window MUST allow interaction
    window
        .set_ignore_cursor_events(false)
        .map_err(|e| e.to_string())?;

    window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn set_window_clickthrough(
    window: Window,
    ignore: bool
) -> Result<(), String> {

    window
        .set_ignore_cursor_events(ignore)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn exit_app(app: AppHandle) {
    app.exit(0);
}

pub fn run() {

    tauri::Builder::default()

        .plugin(tauri_plugin_opener::init())

        .plugin(
            tauri_plugin_global_shortcut::Builder::new().build()
        )

        .setup(|app| {

            let app_handle = app.handle();

            

            // Configure the overlay window
            if let Some(window) = app.get_webview_window("main") {

                window.set_decorations(false).unwrap();
                window.set_resizable(false).unwrap();
                window.set_shadow(false).unwrap();

                #[cfg(target_os = "windows")]
                {
                    install_hit_test_override(&window).unwrap();
                    force_full_monitor_bounds(&window).unwrap();
                }
            }

            // Global shortcut
            app_handle
                .global_shortcut()
                .on_shortcut(
                    "Alt+Space",
                    move |app: &AppHandle<_>, _, event| {

                        if event.state == ShortcutState::Pressed {

                            let _ = app.emit("toggle-toolbar", ());
                        }
                    }
                )
                .unwrap();

            Ok(())
        })

        .invoke_handler(tauri::generate_handler![

            set_window_clickthrough,
            capture_region,
            create_chat_window,
            exit_app,
            stream_ai

        ])

        .run(tauri::generate_context!())

        .expect("error running app");
}