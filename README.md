# Cryptographic Document Scanner & Vault

**Offline-first document fingerprinting for evidence integrity.** A zero-knowledge web app that lets police stations scan documents, store SHA-256 hashes locally, and verify authenticity—with no cloud, no backend, and no data leaving the device.

---

## What is Cryptographic Document Scanner & Vault?

Cryptographic Document Scanner & Vault is a Progressive Web App (PWA) for creating and verifying tamper-proof digital fingerprints of documents. Officers scan or upload documents (images, PDFs) at the scene. The app generates a SHA-256 hash—a unique cryptographic fingerprint—and stores it in a local IndexedDB database. Months later, any copy of that document can be dropped into the verification tool: if the hash matches, it’s authentic; if not, it’s flagged as tampered.

---

## The Problem It Solves

During investigations, physical documents (witness statements, seizure memos, medical reports, chain-of-custody forms) are easy to alter. A single edited sentence or changed date can undermine a case. Cloud-based evidence systems are often slow to deploy, costly, and raise privacy concerns because sensitive data leaves the jurisdiction.

This tool runs **entirely on the device**. No servers, no internet dependency, no data leakage.

---

## How It Works

1. **Scan / Log** — Enter an Officer ID, drop a file (image or PDF). The app reads the raw binary, computes a SHA-256 hash, and saves `fileName`, `hash`, `timestamp`, and `officerId` to a local vault.
2. **Verify** — Drop any file into the verification zone. The app hashes it and checks against the vault. Match = **VERIFIED: Authentic Document**. No match = **TAMPERED: Hash Mismatch**.

Even a one-pixel change in an image or one character in a PDF produces a completely different hash.

---

## Use Cases

| Use Case | Description |
|----------|-------------|
| **Evidence chain of custody** | Log documents at seizure. Later, verify that the exhibit has not been altered before trial. |
| **Witness statements** | Digitally fingerprint signed statements and verify authenticity when they are submitted. |
| **Medical / forensic reports** | Ensure reports have not been tampered with between collection and court. |
| **Seizure memos** | Create verifiable records of seized items and documents at the scene. |
| **Internal audits** | Check that internal documents (signed forms, approvals) have not been modified. |
| **Legal offices** | Verify contracts, affidavits, or certified copies before filing. |

---

## Architecture (Zero-Cloud)

- **Storage:** IndexedDB (via [Dexie.js](https://dexie.org/)) — browser-native, no server.
- **Hashing:** [crypto-js](https://github.com/brix/crypto-js) SHA-256 on raw file binaries.
- **UI:** React + Tailwind CSS, installable as a PWA. Can be wrapped for Android with [Capacitor](https://capacitorjs.com/).

---

## Quick Start (Web)

```bash
git clone https://github.com/Chethan-4255/cryptographic-document-scanner-vault.git
cd cryptographic-document-scanner-vault
npm install
npm run dev
```

Then open the local URL printed in the terminal (`http://localhost:5173` or `http://localhost:5174` if 5173 is busy).
You can disconnect from the internet—scanning and verification work fully offline.

For production build:

```bash
npm run build
```

---

## Android APK (Capacitor)

### Prerequisites

- Node.js + npm
- Android Studio (SDK + emulator/device tools)
- Java 17+ (or Java 21 if using latest default Capacitor Android config)

### Build APK

```bash
npm install
npm run build
npm run cap:sync
```

Then build the debug APK from Android Gradle:

```bash
cd android
./gradlew assembleDebug
```

On Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleDebug
```

Generated APK path:

- `android/app/build/outputs/apk/debug/app-debug.apk`

For convenience, this repository also keeps a root copy:

- `cryptovault-debug.apk`

### Install APK on Android device

Option 1 (Android Studio):
- Open the `android` folder in Android Studio.
- Run on an emulator or connected device.

Option 2 (ADB):

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Supported File Types

- **Images:** PNG, JPG, JPEG, GIF, WebP  
- **Documents:** PDF  

---

## FAQ

### Does this store my actual documents?

No. Only metadata is stored: file name, SHA-256 hash, timestamp, and officer ID. The original file content never leaves your device and is not saved in the database.

### Where is the data stored?

Everything is stored in your browser’s IndexedDB. It stays on the device. No cloud sync, no external servers.

### What happens if I clear my browser data?

The vault is cleared. This is a local-only tool. For long-term retention, consider periodic exports (e.g., CSV of hashes) or backup strategies you control.

### Can this run without internet?

Yes. After the app loads once, core features work offline. Install it as a PWA for best offline behavior.

### Is SHA-256 secure enough for legal evidence?

SHA-256 is a NIST-standard cryptographic hash. Changing even a single bit in a file produces a completely different hash. It is widely used in forensics and legal contexts for document integrity.

### Can I use this on a phone?

Yes. The web app is responsive. For a native Android experience, you can wrap it with Capacitor and build an APK.

### Who built this?

Built by [Chethan Vasthaw Tippani](https://chethan-4255.github.io/Portfolio/).

---

## Tech Stack

| Package | Purpose |
|---------|---------|
| React | UI framework |
| Tailwind CSS | Styling |
| Dexie | IndexedDB wrapper |
| crypto-js | SHA-256 hashing |
| react-dropzone | File upload / drag-and-drop |
| Vite | Build tool |
| vite-plugin-pwa | PWA support |

---

## Contributing

Contributions are welcome. Ideas include: better file handling, improved UI/UX, Capacitor Android setup, export/backup flows, and accessibility improvements.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Author

**Chethan Vasthaw Tippani**  
- [Portfolio](https://chethan-4255.github.io/Portfolio/)  
- [LinkedIn](https://www.linkedin.com/in/chethan-vasthaw/)
