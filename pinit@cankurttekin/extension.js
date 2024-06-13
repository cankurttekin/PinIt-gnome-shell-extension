const { St, Clutter, Gio, Shell } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const MessageTray = imports.ui.messageTray;
const ExtensionUtils = imports.misc.extensionUtils;
const PopupMenu = imports.ui.popupMenu;

const Me = ExtensionUtils.getCurrentExtension();
let PinIt;

class Dialog {
    constructor() {
        if (!Dialog.instance) {
            this._createDialog();
            Dialog.instance = this;
        }
        return Dialog.instance;
    }

    _createDialog() {
        this.dialogOverlay = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            x_expand: true,
            y_expand: true,
            reactive: true,
            can_focus: true,
            visible: true,
            opacity: 0,
            style_class: 'dialog-overlay',
        });

        this.dialog = new St.BoxLayout({
            vertical: true,
            style_class: 'dialog',
            x_expand: true,
            y_expand: true,
        });

        this.titleEntry = new St.Entry({
            style_class: 'dialog-entry',
            can_focus: true,
            hint_text: "Title",
        });

        this.messageEntry = new St.Entry({
            style_class: 'dialog-entry',
            can_focus: true,
            hint_text: "Message",
        });

        this.iconDropdown = new St.Button({
            label: "Choose icon",
            style_class: 'dialog-dropdown',
            can_focus: true,
        });

        this.iconMenu = new PopupMenu.PopupMenu(this.iconDropdown, 0.5, St.Side.TOP, 0);
        Main.uiGroup.add_actor(this.iconMenu.actor);
        this.iconMenu.actor.hide();

        const iconNames = ['Pin', 'Calendar', 'Music', 'Information', 'Warning', 'Error'];
        const iconMapping = {
            'Pin': 'view-pin-symbolic',
            'Calendar': 'office-calendar-symbolic',
            'Music': 'emblem-music-symbolic',
            'Information': 'dialog-information-symbolic',
            'Warning': 'dialog-warning-symbolic',
            'Error': 'dialog-error-symbolic'
        };

        this.selectedIcon = iconMapping['Pin'];
        iconNames.forEach(iconName => {
            let item = new PopupMenu.PopupMenuItem(iconName);
            item.connect('activate', () => {
                this.selectedIcon = iconMapping[iconName];
                this.iconDropdown.label = iconName;
            });
            this.iconMenu.addMenuItem(item);
        });

        this.iconDropdown.connect('button-press-event', () => {
            this.iconMenu.toggle();
        });

        this.submitButton = new St.Button({
            label: "Submit",
            style_class: 'dialog-button submit-button',
        });

        this.submitButton.connect('clicked', this._onSubmit.bind(this));

        this.cancelButton = new St.Button({
            label: "Cancel",
            style_class: 'dialog-button cancel-button',
        });

        this.cancelButton.connect('clicked', this._destroyDialog.bind(this));

        this.dialog.add_child(this.titleEntry);
        this.dialog.add_child(this.messageEntry);
        this.dialog.add_child(this.iconDropdown);
        this.dialog.add_child(this.submitButton);
        this.dialog.add_child(this.cancelButton);
        this.dialogOverlay.add_child(this.dialog);

        Main.layoutManager.addChrome(this.dialogOverlay);

        this.dialogOverlay.ease({
            opacity: 255,
            duration: 250,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });

        this._applyThemeStyles();
        this._connectThemeChangeSignal();

        // Position the dialog at the top center
        this.dialogOverlay.set_position(
            Math.floor(Main.layoutManager.primaryMonitor.width / 2 - this.dialog.width / 2),
            50
        );
    }

    _applyThemeStyles() {
        const settings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        const gtkTheme = settings.get_string('gtk-theme');

        if (gtkTheme.includes('dark')) {
            this.dialog.add_style_class_name('dialog-dark');
            this.dialog.remove_style_class_name('dialog');
        } else {
            this.dialog.add_style_class_name('dialog');
            this.dialog.remove_style_class_name('dialog-dark');
        }
    }

    _connectThemeChangeSignal() {
        const settings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        settings.connect('changed::gtk-theme', () => {
            this._applyThemeStyles();
        });
    }

    _onSubmit() {
        let title = this.titleEntry.get_text();
        let message = this.messageEntry.get_text();
        let iconName = this.selectedIcon;
        this._showNotification(title, message, iconName);
        this._destroyDialog();
    }

    _showNotification(title, message, iconName) {
        let source = new MessageTray.Source(Me.metadata.name, iconName);
        Main.messageTray.add(source);

        let notificationIcon = new Gio.ThemedIcon({ name: iconName });

        let notification = new MessageTray.Notification(source, title, message, { gicon: notificationIcon });
        notification.setTransient(true);
        source.showNotification(notification);
    }

    _destroyDialog() {
        this.dialogOverlay.ease({
            opacity: 0,
            duration: 250,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                this.dialogOverlay.destroy();
                Dialog.instance = null; // Reset singleton instance
            }
        });
    }
}

class MyExtension {
    constructor() {
        this._init();
    }

    _init() {
        this._panelButton = new PanelMenu.Button(0.0, 'MyExtension', false);

        let icon = new St.Icon({
            gicon: new Gio.ThemedIcon({ name: 'view-pin-symbolic' }),
            style_class: 'system-status-icon',
        });

        this._panelButton.add_child(icon);
        this._panelButton.connect('button-press-event', this._showDialog.bind(this));
        Main.panel.addToStatusArea('MyExtension', this._panelButton);
    }

    _showDialog() {
        new Dialog();
    }

    enable() {
        // Extension enable hook
    }

    disable() {
        if (Dialog.instance) {
            Dialog.instance._destroyDialog();
        }
        this._panelButton.destroy();
    }
}

function init() {
    //return new MyExtension();
}

function enable() {
    PinIt = new MyExtension();
    //Me._extension = init();
    //Me._extension.enable();
}

function disable() {
    //Me._extension.disable();
    PinIt.disable();
    PinIt = null;
}

