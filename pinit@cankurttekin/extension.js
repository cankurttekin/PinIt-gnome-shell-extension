import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Gio from "gi://Gio";

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

const Pin = GObject.registerClass(
    class Pin extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, _('test'));
            
            this._icon = new St.Icon({
                icon_name: 'view-pin-symbolic', // Change icon to a note symbol
                style_class: 'system-status-icon',
            });
            this.add_child(this._icon);
            
            this.iconBox = new St.BoxLayout({
                x_align: Clutter.ActorAlign.CENTER,
                vertical: false,
            });

            const iconNames = ['Pin', 'Calendar', 'Music', 'Alarm', 'Information', 'Warning', 'Error'];
            const iconMapping = {
                'Pin': 'view-pin-symbolic',
                'Calendar': 'x-office-calendar-symbolic',
                'Music': 'emblem-music-symbolic',
                'Alarm': 'alarm-symbolic',
                'Information': 'dialog-information-symbolic',
                'Warning': 'dialog-warning-symbolic',
                'Error': 'dialog-error-symbolic'
            };
            this.selectedIcon = iconMapping['Pin'];
            let activeButton = null;
            // Create icon buttons and add them to the box layout
            iconNames.forEach(iconName => {
                let iconButton = new St.Button({
                    style_class: 'quick-settings icon-button',
                    style: 'margin: 4px; margin-top: 8px;',
                    child: new St.Icon({
                        gicon: Gio.icon_new_for_string(iconMapping[iconName]),
                        can_focus: true,
                    }),
                });
                iconButton.connect('clicked', () => {
                    this.selectedIcon = iconMapping[iconName];

                    if (activeButton) {
                        activeButton.remove_style_class_name('flat');
                    }

                    iconButton.add_style_class_name('flat');

                    // Update the active button reference
                    activeButton = iconButton;
                });
                this.iconBox.add_child(iconButton);
            });
            
            this.titleEntry = new St.Entry({
                hint_text: "Title",
                can_focus: true,
                track_hover: true,
                style: 'margin-left: 8px; margin-right: 8px; margin-top: 8px;'
            });

            let vbox1 = new St.BoxLayout({
                vertical: true,
                style_class: 'popup-menu-box'
            });
            vbox1.add_child(this.titleEntry);

            this.messageEntry = new St.Entry({
                hint_text: "Message",
                can_focus: true,
                track_hover: true,
                style: 'margin-left: 8px; margin-right: 8px; margin-top: 8px;',
            });

            let vbox2 = new St.BoxLayout({
                vertical: true,
                style_class: 'popup-menu-box'
            });
            vbox2.add_child(this.messageEntry);
            
            let submitIcon = new St.Icon({
                gicon: Gio.icon_new_for_string('view-pin-symbolic'),
                style_class: 'system-status-icon'
            });
            
            // Create a label
            let submitLabel = new St.Label({
                text: ' Pin It',
                style_class: 'system-menu-action'
            });
            
            // Create a box layout to contain both icon and label
            let submitBox = new St.BoxLayout({
                style_class: 'icon-label-box',
                vertical: false,
                reactive: true,
                track_hover: true,
            });
            submitBox.add_child(submitIcon);
            submitBox.add_child(submitLabel);
            
            // Create the button with the icon and label
            let submitButton = new St.Button({
                style_class: 'icon-button', // Use GNOME Shell style class for button
                child: submitBox, // Use the box layout containing icon and label as the child
                x_align: Clutter.ActorAlign.END,
                can_focus: true,
                style: 'margin-top: 8px; margin-bottom: 8px; margin-right: 8px; '
            });
            
            // Connect click event handler
            submitButton.connect('clicked', () => {
                let title = this.titleEntry.get_text();
                let message = this.messageEntry.get_text();
                let iconName = this.selectedIcon;
                this._showNotification(title, message, iconName);
                this.titleEntry.set_text('');
                this.messageEntry.set_text('');
            });
            

            // Create a vertical box layout to arrange components vertically
            let vbox = new St.BoxLayout({
                vertical: true,
                style_class: 'popup-menu-box'
            });
            vbox.add_child(this.iconBox);
            vbox.add_child(vbox1);
            vbox.add_child(vbox2);
            vbox.add_child(submitButton);
            let popupEdit = new PopupMenu.PopupMenuSection();
            popupEdit.actor.add_child(vbox);
            this.menu.addMenuItem(popupEdit);
            this.menu.actor.add_style_class_name('note-entry');
        }
        
        _showNotification(title, message, iconName) {
            let extensionObject = Extension.lookupByUUID('pinit@cankurttekin');
            let notificationIcon = new Gio.ThemedIcon({ name: iconName });
            
            let source = new MessageTray.Source({
                title: _('PinIt'),
                iconName: 'view-pin-symbolic',
            });

            let notification = new MessageTray.Notification({
                source: source,
                title: title,
                body: message,
                gicon: notificationIcon,
                isTransient: true,
                urgency: MessageTray.Urgency.LOW,
            });
            // Reset the notification source if it's destroyed
            source.connect('destroy', _source => {
                source = null;
            });
            Main.messageTray.add(source);
            source.addNotification(notification);
        }
    }
);

export default class PinItExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._pin = new Pin(this._settings);
        Main.panel.addToStatusArea(this.uuid, this._pin);
    }
    disable() {
        this._pin.destroy();
        this._pin = null;
        this._settings = null;
    }
}
