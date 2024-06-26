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
            track_hover: true,
        });

        this.messageEntry = new St.Entry({
            style_class: 'dialog-entry',
            can_focus: true,
            hint_text: "Message",
            track_hover: true,
        });

        this.iconBox = new St.BoxLayout({
            vertical: false,
            reactive: true,
            track_hover: true,
        });

        this.iconMenu = new PopupMenu.PopupMenu(this.iconDropdown, 0.5, St.Side.TOP, 0);
        Main.uiGroup.add_actor(this.iconMenu.actor);
        this.iconMenu.actor.hide();

        const iconNames = ['Pin', 'Calendar', 'Alarm', 'Music', 'Information', 'Warning', 'Error'];
        const iconMapping = {
            'Pin': 'view-pin-symbolic',
            'Calendar': 'office-calendar-symbolic',
            'Alarm': 'alarm-symbolic',
            'Music': 'emblem-music-symbolic',
            'Information': 'dialog-information-symbolic',
            'Warning': 'dialog-warning-symbolic',
            'Error': 'dialog-error-symbolic'
        };

        this.selectedIcon = iconMapping['Pin'];
        
        iconNames.forEach(iconName => {
            let iconButton = new St.Button({
                style_class: 'pinit-extension icon-button',
                child: new St.Icon({
                    gicon: Gio.icon_new_for_string(iconMapping[iconName]),
                    style_class: 'icons',
                }),
            });

            iconButton.connect('clicked', () => {
                this.selectedIcon = iconMapping[iconName];
                this._updateSelectedIcon(iconButton);
            });
            this.iconBox.add_child(iconButton);
        });

        this.submitButton = new St.Button({
            label: "Submit",
            style_class: 'dialog-button submit-button',
        });

        this.submitButton.connect('clicked', this._onSubmit.bind(this));

        this.dialog.add_child(this.iconBox);
        this.dialog.add_child(this.titleEntry);
        this.dialog.add_child(this.messageEntry);
        this.dialog.add_child(this.submitButton);
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

        this._outsideClickHandler = this._onOutsideClick.bind(this);
        this._eventConnectionId = global.stage.connect('captured-event', this._outsideClickHandler);
    }



        
    _applyThemeStyles() {
        const settings = ExtensionUtils.getSettings();
        const themeMode = settings.get_string('theme-mode');
        const gtkSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        const gtkTheme = gtkSettings.get_string('gtk-theme');

        if (themeMode === 'dark' || (themeMode === 'system' && gtkTheme.includes('dark'))) {
            this.dialog.add_style_class_name('dialog-dark');
            this.dialog.remove_style_class_name('dialog');
            this.dialog.remove_style_class_name('dialog-oled');
        } else if (themeMode === 'oled') {
            this.dialog.add_style_class_name('dialog-oled');
            this.dialog.remove_style_class_name('dialog-dark');
            this.dialog.remove_style_class_name('dialog');
        } else if (themeMode === 'light') {
            this.dialog.add_style_class_name('dialog');
            this.dialog.remove_style_class_name('dialog-dark');
            this.dialog.remove_style_class_name('dialog-oled');
        }  else {
            if(gtkTheme.toLowerCase().includes('dark')) {
            	this.dialog.add_style_class_name('dialog-dark');
            	this.dialog.remove_style_class_name('dialog');
            	this.dialog.remove_style_class_name('dialog-oled');
            } else {
            	this.dialog.add_style_class_name('dialog');
            	this.dialog.remove_style_class_name('dialog-dark');
            	this.dialog.remove_style_class_name('dialog-oled');
            }
            
        }
    }

    _connectThemeChangeSignal() {
        const gtkSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        gtkSettings.connect('changed::gtk-theme', () => {
            this._applyThemeStyles();
        });
        const settings = ExtensionUtils.getSettings();
        settings.connect('changed::theme-mode', () => {
            this._applyThemeStyles();
        });
    }

    _onOutsideClick(actor, event) {
        if (event.type() === Clutter.EventType.BUTTON_PRESS) {
            let [x, y] = event.get_coords();
            if (!this.dialog.contains(global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y))) {
                this._destroyDialog();
            }
        }
    }

    _onSubmit() {
        let title = this.titleEntry.get_text();
        let message = this.messageEntry.get_text();
        let iconName = this.selectedIcon;
        this._showNotification(title, message, iconName);
        this._destroyDialog();
    }

    _updateSelectedIcon(selectedButton) {
        this.iconBox.get_children().forEach(button => {
            button.remove_style_class_name('selected-icon');
        });
        selectedButton.add_style_class_name('selected-icon');
    }

    _showNotification(title, message, iconName) {
        let source = new MessageTray.Source(Me.metadata.name, iconName);
        Main.messageTray.add(source);

        let notificationIcon = new Gio.ThemedIcon({ name: iconName });

        let notification = new MessageTray.Notification(source, title, message, { gicon: notificationIcon });
        notification.setTransient(false);
        notification.setUrgency('Urgency.LOW');

        source.showNotification(notification);
    }

    _destroyDialog() {
        if (this._eventConnectionId) {
            global.stage.disconnect(this._eventConnectionId);
            this._eventConnectionId = null;
        }

        this.dialogOverlay.ease({
            opacity: 0,
            duration: 250,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                this.dialogOverlay.destroy();
                Dialog.instance = null;
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

