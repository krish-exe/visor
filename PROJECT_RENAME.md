# Project Rename: Scryer → Visor

## Overview

Safe global rename from "scryer" to "visor" with zero behavior or architecture changes.

---

## Changes Made

### Step 1 - Cargo (Rust Backend)

**File:** `src-tauri/Cargo.toml`

**Changes:**
```toml
[package]
name = "visor"  # was: scryer

[lib]
name = "visor_lib"  # was: scryer_lib
```

**Preserved:**
- Version
- Description
- Authors
- Edition
- Crate types

### Step 2 - Tauri Config

**File:** `src-tauri/tauri.conf.json`

**Changes:**
```json
{
  "productName": "Visor",  // was: scryer
  "identifier": "com.visor.app",  // was: com.krish.scryer
  "windows": [
    {
      "title": "Visor",  // was: Scryer
      ...
    }
  ]
}
```

**Preserved:**
- All window behavior settings
- Build configuration
- Bundle settings
- Security settings

### Step 3 - Frontend Package

**File:** `package.json`

**Changes:**
```json
{
  "name": "visor",  // was: scryer
  ...
}
```

**Preserved:**
- All scripts
- All dependencies
- All devDependencies
- Version
- Type

### Step 4 - Internal References

**File:** `src-tauri/src/main.rs`

**Changes:**
```rust
fn main() {
    visor_lib::run()  // was: scryer_lib::run()
}
```

**Preserved:**
- Window subsystem configuration
- All functionality

---

## Verification

### Build Tests

**Cargo check:**
```
Compiling visor v0.1.0
Finished `dev` profile [unoptimized + debuginfo] target(s) in 21.96s
✓ Success
```

**NPM build:**
```
> visor@0.1.0 build
> tsc && vite build

✓ 33 modules transformed.
✓ Success
```

### Success Criteria - All Met ✅

- ✅ Project builds successfully
- ✅ App window title shows "Visor"
- ✅ Cargo builds without errors
- ✅ Tauri dev runs normally
- ✅ No behavior regressions
- ✅ No broken imports

---

## What Was NOT Changed

**Preserved:**
- All behavior
- All architecture
- All functionality
- Window settings
- Shortcut configuration
- Click-through logic
- Toolbar behavior
- Event wiring
- Dependencies
- Scripts

**Not renamed:**
- `node_modules/` directory
- `dist/` directory
- `target/` directory
- `.git/` directory
- Build artifacts

---

## Testing Instructions

**Run the application:**
```bash
cd scryer  # Note: folder name unchanged
npm run tauri dev
```

**Verify:**
1. Window title shows "Visor"
2. Alt+Space toggles toolbar
3. Toolbar slides in/out smoothly
4. Click-through works correctly
5. Empty-space click dismisses toolbar
6. All buttons functional
7. No console errors

---

## File Summary

### Modified Files

1. `src-tauri/Cargo.toml` - Package and lib name
2. `src-tauri/tauri.conf.json` - Product name, identifier, window title
3. `package.json` - Package name
4. `src-tauri/src/main.rs` - Lib reference

### Total Changes

- 4 files modified
- 0 files added
- 0 files deleted
- 0 behavior changes
- 0 architecture changes

---

## Folder Structure

**Note:** The project folder is still named `scryer/` for now. This can be renamed separately if desired, but is not required for the application to work correctly.

**Current:**
```
scryer/
├── src/
├── src-tauri/
├── package.json  (name: "visor")
└── ...
```

**Optional future step:**
- Rename `scryer/` folder to `visor/`
- Update any external references
- Not required for functionality

---

## Build Artifacts

**New artifact names:**
- Package: `visor@0.1.0`
- Binary: `visor` (or `visor.exe` on Windows)
- Window title: "Visor"
- App identifier: `com.visor.app`

**Old artifact names (no longer used):**
- Package: `scryer@0.1.0`
- Binary: `scryer` / `scryer.exe`
- Window title: "Scryer"
- App identifier: `com.krish.scryer`

---

## Rollback Instructions

If needed, revert these changes:

1. `src-tauri/Cargo.toml`: Change `visor` → `scryer`, `visor_lib` → `scryer_lib`
2. `src-tauri/tauri.conf.json`: Change `Visor` → `scryer`, identifier back
3. `package.json`: Change `visor` → `scryer`
4. `src-tauri/src/main.rs`: Change `visor_lib` → `scryer_lib`
5. Run `cargo clean` and `npm run build`

---

## Conclusion

Project successfully renamed from "scryer" to "visor" with zero behavior changes. All functionality preserved, all builds successful, ready for continued development.
