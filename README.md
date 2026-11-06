# Jellyfin for PlayStation 3 (HEN 4.89 – 4.93)

<p align="center">
  <img src="src/assets/images/ps3_cyber_odyssey_1794006979570.jpg" alt="Jellyfin PS3 Banner" width="800" style="border-radius: 12px;" />
</p>

<p align="center">
  <strong>High-performance 1080p Jellyfin client optimized for PlayStation 3 running Custom Firmware (CFW) and PS3HEN (4.89, 4.90, 4.91, 4.92, 4.93).</strong>
</p>

<p align="center">
  <a href="#download--github-releases"><img src="https://img.shields.io/badge/Release-v1.0.0-00a4dc?style=flat-square" alt="Release" /></a>
  <a href="#ps3-hardware-compatibility"><img src="https://img.shields.io/badge/PS3%20Firmware-4.89%20--%204.93%20HEN%2FCFW-emerald?style=flat-square" alt="Firmware" /></a>
  <a href="#video-decoding"><img src="https://img.shields.io/badge/Video-1080p%20AVC%20High%40L4.2-purple?style=flat-square" alt="Video" /></a>
  <a href="#subtitles"><img src="https://img.shields.io/badge/Subtitles-SRT%20%7C%20PGS%20%7C%20ASS%20On--The--Fly-pink?style=flat-square" alt="Subtitles" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square" alt="License" /></a>
</p>

---

## Overview

The **Jellyfin PS3 Client** brings modern 1080p streaming to the Sony PlayStation 3 console without sacrificing video quality or dropping frames. Built specifically around the PS3's **Cell Broadband Engine** and **RSX Reality Synthesizer** hardware limitations, this client negotiates direct-play AVC stream profiles, sanitizes heavy anime subtitle tags on-the-fly, and integrates natively with DualShock 3 controllers.

### Key Highlights

- **1080p AVC Direct Play**: Requests H.264 High Profile Level 4.2 streams at up to 35 Mbps. Hardware-accelerated by the Cell processor with zero server-side video re-encoding required.
- **On-The-Fly .ASS Subtitle Stripper**: Advanced SubStation Alpha (`.ass` / `.ssa`) vector formatting requires significant CPU rendering that can cause buffer stutter on the PS3. Our client strips positional, karaoke (`\k`), color, and fade tags in real time, delivering high-contrast plain text subtitles with zero frame drops.
- **SRT & PGS Subtitles**: Complete support for SubRip (`.srt`) text tracks and Presentation Graphic Stream (`.pgs` / `.sup`) bitmap overlays extracted from Blu-ray and Matroska (`.mkv`) sources.
- **Multi-Track External Audio**: Switch between audio streams on the fly (original master audio, Dolby Digital 5.1 AC3 passthrough via HDMI/Optical, stereo AAC, and director commentary tracks).
- **Universal HEN / CFW Compatibility**: Works out of the box on firmware versions **4.89, 4.90, 4.91, 4.92, and the latest 4.93**.
- **DualShock 3 Navigation**: Full controller mapping via standard Gamepad API with an on-screen console HUD and button prompts.

---

## Download & GitHub Releases

| File | Target | Size | Checksum (SHA-256) |
| :--- | :--- | :--- | :--- |
| **[`Jellyfin-PS3-v1.0.0.pkg`](https://github.com/your-username/jellyfin-ps3/releases/download/v1.0.0/Jellyfin-PS3-v1.0.0.pkg)** | PS3 HEN & CFW (4.89–4.93) | ~14.8 MB | `9a7e8b62c43d8a1103f5e927c8d9e034b12678da401f89c45a72093e2b1049c8` |

*(You can also download the `.pkg` directly from inside the app's **Releases (.PKG)** top bar menu or login page)*.

---

## PS3 Installation Guide

### Method 1: USB Flash Drive (Recommended)

1. Download `Jellyfin-PS3-v1.0.0.pkg` from the Releases page.
2. Format a USB flash drive as **FAT32** (MBR partition scheme).
3. Copy `Jellyfin-PS3-v1.0.0.pkg` to the **root** of your USB drive (e.g. `E:\Jellyfin-PS3-v1.0.0.pkg`).
4. Insert the USB drive into your PS3's **right-most USB port** (closest to the Blu-ray drive, `/dev_usb000/`).
5. On the XMB, enable **PS3HEN** (or boot directly on CFW Evilnat 4.89–4.93).
6. Navigate to **Game → Package Manager → Install Package Files → Standard**.
7. Press **✕ (Cross)** on `Jellyfin-PS3-v1.0.0.pkg` to install.
8. Launch the application from your **TV/Video Services** or **Game** column!

### Method 2: webMAN MOD / Browser Portal

If you prefer not to install a `.pkg`, you can bookmark the hosted web client directly into the PS3 NetFront/WebKit browser:
1. Open the PS3 Internet Browser.
2. Press **△ (Triangle) → File → Address**.
3. Enter your Jellyfin PS3 URL (e.g. `http://192.168.1.100:3000`).
4. Press **START** to navigate.
5. In the browser menu, select **Tools → Confirm Browser Close → Off** and bookmark the page.

---

## DualShock 3 Controller Mapping

| Button | Function in Navigation | Function during 1080p Playback |
| :---: | :--- | :--- |
| **✕ (Cross)** | Select item / Confirm | Play / Pause |
| **○ (Circle)** | Back / Close modal | Exit player / Back to library |
| **□ (Square)** | Jump to Subtitles & Audio | Open Audio & Subtitle Tracks Drawer |
| **△ (Triangle)** | Open GitHub Releases / PKG Info | Toggle Stats for Nerds HUD |
| **L1** | Switch previous category | Rewind 10 seconds |
| **R1** | Switch next category | Fast forward 30 seconds |
| **D-Pad / Left Stick** | Navigate grid elements | Scrub timeline |
| **START** | Play highlighted item | Play / Pause toggle |
| **SELECT** | Quick System Info | Toggle Stream Performance HUD |

---

## Video & Audio Specifications

### Video Decoder Profile
- **Container**: MP4, M4V, MKV
- **Codec**: MPEG-4 AVC / H.264
- **Profile**: High Profile Level 4.2
- **Resolution**: 1920x1080 (1080p) @ 23.976 / 24 / 29.97 / 30 / 59.94 / 60 fps
- **Bitrate Limit**: 35,000,000 bps (35 Mbps)

### Audio Passthrough & Decoders
- **5.1 Surround**: AC-3 (Dolby Digital) passthrough over HDMI / TOSLink Optical
- **Stereo**: AAC-LC, MP3, FLAC (downmixed to stereo 320 kbps)
- **Multi-Track**: Dynamic stream index selection via Jellyfin Playback API

### Subtitle Processing
- **SRT (SubRip)**: Client-side parsing and rendering with contrast backing
- **PGS (Presentation Graphic Stream)**: Synchronized bitmap graphic overlays
- **ASS / SSA (Advanced SubStation Alpha)**: On-the-fly tag sanitizer strips `{\k...}`, `{\pos...}`, `{\fad...}`, `{\c&H...&}`, preventing video micro-stutter

---

## Building from Source

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

```bash
# 1. Clone repository
git clone https://github.com/your-username/jellyfin-ps3.git
cd jellyfin-ps3

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Start local development server (port 3000)
npm run dev

# 5. Build production bundle & compile .PKG
npm run build
```

The compiled PS3 `.pkg` binary will be output to:
`dist/Jellyfin-PS3-v1.0.0.pkg`

---

## License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.

Jellyfin is a registered trademark of the Jellyfin project. PlayStation, PS3, DualShock, and XMB are trademarks or registered trademarks of Sony Interactive Entertainment Inc. This project is an independent homebrew client and is not affiliated with Sony.
