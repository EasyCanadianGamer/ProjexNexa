#[cfg_attr(mobile, tauri::mobile_entry_point)]
use serde_json::Value;
use std::fs;

#[tauri::command]
fn get_app_info() -> Result<(String, String), String> {
    // Read the tauri.conf.json file
    let config = fs::read_to_string("tauri.conf.json").map_err(|e| e.to_string())?;

    // Parse the JSON
    let config: Value = serde_json::from_str(&config).map_err(|e| e.to_string())?;

    // Extract the app name and version
    let app_name = config["productName"]
        .as_str()
        .ok_or("productName not found in tauri.conf.json")?
        .to_string();

    let app_version = config["version"]
        .as_str()
        .ok_or("version not found in tauri.conf.json")?
        .to_string();

    Ok((app_name, app_version))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![get_app_info])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(()) // Corrected from `ok(())` to `Ok(())`
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
