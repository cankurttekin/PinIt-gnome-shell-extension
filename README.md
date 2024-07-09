# Pin It GNOME Extension
 [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
 <br>
 GNOME Shell Extension to add your simple notes to the notification area.
 
Click on tray icon, it will show up a dialog where you can input your notification title, message and optionally icon(default will be same as the extension icon).

<br>

[<img src="/resources/get_it_on_gnome_extensions.png">](https://extensions.gnome.org/extension/7083/pin-it/)

_Important: This extension does not log your notifications to a file; do not put information that you would care if it's lost._
<br>
_Due to the limit on the GNOME Shell Version 45 & 46, only the 3 most recent notifications are shown for every app, "so notifications can disappear before you have a chance to act on them"([blogs.gnome.org](https://blogs.gnome.org/shell-dev/2024/04/23/notifications-46-and-beyond/#A-single-messy-list)).<br>
https://gitlab.gnome.org/GNOME/gnome-shell/blob/main/js/ui/messageTray.js#L563
<br>
For older GNOME Versions; you can add as many pins as you like._

## Version

This extension supports GNOME Shell `3.4?` to `46`

|Branch                   |Version|Compatible GNOME version|
|-------------------------|:-----:|------------------------|
| [main](https://github.com/cankurttekin/PinIt-Gnome-Extension)                  |    12  | GNOME 45 & 46          |
| gnome-shell-before-45   |  [4.3](https://github.com/cankurttekin/PinIt-Gnome-Extension/releases/tag/4.3)  | GNOME 3.4 -> 44        |

_Tested on GNOME 42 & 46._

# Installing
You can get this extension from [extensions.gnome.org](https://extensions.gnome.org/extension/7083/pin-it/) or you can download the source from [releases](https://github.com/cankurttekin/PinIt-Gnome-Extension/releases) and copy pinit@cankurttekin to your `/.local/share/gnome-shell/extensions/` directory.

# Screenshots & Features
![Screenshot_1](/screenshots/tray.png)
<br>
![Screenshot_2](/screenshots/dialog.png)
![Screenshot_5](/screenshots/dialogdark.png)
<br>
![Screenshot_3](/screenshots/notifications.png)
<br>

# Contribute
You can help with development by contributing code, testing on other GNOME versions and reporting issues.
