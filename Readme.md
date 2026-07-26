# What is ProjexNexa?

ProjexNexa is a modern project dashboard built from the ground-up to be a easy way to showcase your project's milestones and progress. ProjexNexa for now is for Windows but down the line its going to cross-platform and since its using [Tauri](https://v2.tauri.app/) framework, it can run on all platforms, Windows, MacOS, and Linux without any trouble. Some ProjexNexa's features in summary are:

* It looks modern
* Easy to use
* Upload and import project lists from a excel sheet
* and most importantly is Open Source Software (OSS)!

ProjexNexa is currently under development. You give your suggestions on the [discussions](https://github.com/EasyCanadianGamer/ProjexNexa/discussions) page.

If you feel comfortable in writing code using Typescript and Rust, we highly encourage you to contribute to this project.

---

## Project Roadmap

* [x] Add settings
  * [X] change modes ( Light, Dark, and System Prefrence)
  * [x] Add a About section
* [ ] Auto Updates
* [x] Change the days left to allow to use dates instead
* [ ] Have it support MacOS, Linux, and Windows
  * [X] MacOS
  * [x] Linux
  * [ ] Windows

Recommend us a feature by opening an [discussions](https://github.com/EasyCanadianGamer/ProjexNexa/discussions) if you'd like to.

---

## Installation

If you want to install ProjexNexa on your system, you can download the installer for your operating system [on the release page](https://github.com/EasyCanadianGamer/ProjectManagement/releases). Please note that the current version is not stable yet, and you may encounter various bugs.

---

## Bug Reporting

If you find any bugs, please report it by submitting an issue on our [issues](https://github.com/EasyCanadianGamer/ProjexNexa/issues) page with a detailed explanation. Giving some screenshots would also be very helpful.

## Feature Request

You can also submit a feature request on our [issue](https://github.com/EasyCanadianGamer/ProjexNexa/issues) page or [discussions](https://github.com/EasyCanadianGamer/ProjexNexa/discussions) and we will try to implement it as soon as possible. If you want to contribute to this project, please contribute to this project.

---

## Archetecture

ProjexNexa is a cross-platform application build using Tauri framework. Tauri is based on the OS specific webview and rust to work. Read about tauri here.

ProjexNexa is a polygot applications. ProjexNexa relies on Rust and TS. The rust code are under `src-tauri` directory whereas the webview is in the `src` directory.


---

## Development

If you want to run this project in your local system, please follow this guide:

1. Fork this project
2. Clone this project using the command below ``git clone https://www.github.com/EasyCanadianGamer/ProjectNexa``
3. Follow [this guide](https://v2.tauri.app/start/prerequisites/) to setup Tauri environment
4. change directory
   1. `cd ProjexNexa/dashboard`
5. Install all dependencies using [npm](https://nodejs.org/en/download)
   1. `npm install`
6. Run the project in development mode. Please note it will takes some time for Cargo to install all dependencies for the first run.
   1. `npx tauri dev`

---


## Contribution Guide 
We welcome contributions from the community! 🚀 

Please check out our [Contribution Guide](CONTRIBUTING.md) for details on how to get started.


---

## Release Workflow (cutting a new version)

Releases are driven entirely by git tags in the form `vX.Y.Z`. Pushing a tag is what kicks everything off — there is no manual "run release" button.

1. **Bump the version** in `dashboard/src-tauri/tauri.conf.json` (`"version"` field) to match the release you're about to cut, e.g. `0.1.8`. Commit that change.
2. **Tag the commit** and push the tag:
   ```bash
   git tag v0.1.8
   git push origin v0.1.8
   ```
3. Pushing a `v*` tag triggers two workflows in parallel:
   * `.github/workflows/build-macOS.yml` — builds the `.app`/`.dmg`, packages `ProjexNexa-homebrew.app.tar.gz`, and creates/updates the GitHub Release for that tag.
   * `.github/workflows/build-linux.yml` — builds the AppImage/`.deb`/`.rpm` and attaches them to the same Release.
4. Once the Release is **published**, `.github/workflows/update-homebrew.yml` fires automatically (`on: release: types: [published]`). It:
   * Downloads `ProjexNexa-homebrew.app.tar.gz` from the latest Release and hashes it.
   * Rewrites `Formula/projexnexa.rb` in the `EasyCanadianGamer/homebrew-projexnexa` tap repo with the new URL + sha256.
   * Commits and pushes that formula update using the `PAT_TOKEN` secret (needs write access to the tap repo).

**All three workflows also support `workflow_dispatch`** (manual "Run workflow" button in the Actions tab) if you need to re-run one without pushing a new tag — e.g. re-running `update-homebrew.yml` by hand if the formula update failed but the Release already exists.

**Gotchas to remember:**
* **Nothing bumps the version automatically.** Step 1 (editing `tauri.conf.json`) is manual — none of the three workflows touch that file. If you tag without bumping it first, the built app will report the old version even though the GitHub Release/Homebrew formula say otherwise.
* The tag (`vX.Y.Z`) and `tauri.conf.json`'s `"version"` should stay in sync — the tag is what names the GitHub Release and Homebrew formula, but the app itself reports whatever's in `tauri.conf.json`.
* `update-homebrew.yml` only runs off the **latest** published Release via the GitHub API, so don't publish releases out of order.
* Secrets required: `TAURI_SIGNING_PRIVATE_KEY` (build signing, both platforms), `PAT_TOKEN` (push access to the separate `homebrew-projexnexa` tap repo).

---

## LICENSE

[Apache-2.0](https://github.com/EasyCanadianGamer/ProjexNexa#Apache-2.0-1-ov-file)

---

## Love my work?

<a href='https://ko-fi.com/C0C4V12R4' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

Linux Command for dev
WEBKIT_DISABLE_DMABUF_RENDERER=1 npx tauri dev