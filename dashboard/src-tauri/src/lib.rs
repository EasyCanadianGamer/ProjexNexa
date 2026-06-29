#[cfg_attr(mobile, tauri::mobile_entry_point)]
use serde_json::Value;
use std::fs;
use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
fn get_app_info() -> Result<(String, String), String> {
    let config = fs::read_to_string("tauri.conf.json").map_err(|e| e.to_string())?;
    let config: Value = serde_json::from_str(&config).map_err(|e| e.to_string())?;
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

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<Value, String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    match updater.check().await {
        Ok(Some(update)) => Ok(serde_json::json!({
            "available": true,
            "version": update.version
        })),
        Ok(None) => Ok(serde_json::json!({
            "available": false,
            "version": null
        })),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    let update = updater
        .check()
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "No update available".to_string())?;
    update
        .download_and_install(|_, _| {}, || {})
        .await
        .map_err(|e| e.to_string())?;
    app.restart();
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            check_for_updates,
            install_update
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
