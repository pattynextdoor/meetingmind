# Installation

## Download from GitHub (Recommended)

1. Go to the [latest release](https://github.com/pattynextdoor/meetingmind/releases/latest)
2. Download these three files from the release assets:
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. In your vault, create the plugin folder:
   ```
   .obsidian/plugins/meetingmind/
   ```
4. Copy the three downloaded files into that folder
5. Restart Obsidian
6. Go to **Settings → Community Plugins** and enable **MeetingMind**

::: tip One-liner for terminal users
```bash
mkdir -p /path/to/vault/.obsidian/plugins/meetingmind && \
cd /path/to/vault/.obsidian/plugins/meetingmind && \
curl -sL https://github.com/pattynextdoor/meetingmind/releases/latest/download/main.js -O && \
curl -sL https://github.com/pattynextdoor/meetingmind/releases/latest/download/manifest.json -O && \
curl -sL https://github.com/pattynextdoor/meetingmind/releases/latest/download/styles.css -O
```
:::

## From Community Plugins

::: info Coming Soon
MeetingMind is currently under review for the Obsidian Community Plugin store. Once approved, you'll be able to install directly from **Settings → Community Plugins → Browse**.
:::

## Verify Installation

After installation, you should see:

- **Settings tab**: Settings → MeetingMind
- **Status bar**: A sync icon in the bottom status bar
- **Commands**: Open command palette and search "MeetingMind"

## Updating

When a new version is released, download the updated files from the [releases page](https://github.com/pattynextdoor/meetingmind/releases) and replace the files in your plugins folder. Once we're in the Community Plugin store, Obsidian will handle updates automatically.

