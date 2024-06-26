const { GObject, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
	this.settings = ExtensionUtils.getSettings();

}

function buildPrefsWidget() {
    let frame = new Gtk.Box({
    	orientation: Gtk.Orientation.VERTICAL,
	'margin-top': 20,
	'margin-bottom': 20,
	'margin-start': 20,
	'margin-end': 20
    
    })
    
    let vbox = new Gtk.Box({
		orientation: Gtk.Orientation.VERTICAL,
		spacing: 20
    })

    let themeLabel = new Gtk.Label({ label: "Theme:", xalign: 0 });
    let themeDropDown = new Gtk.DropDown({
        model: Gtk.StringList.new(["Follow system", "Light", "Dark", "OLED"]),
    });


    themeDropDown.connect('notify::selected-item', (widget) => {
        this.settings.set_string('theme-mode', this._getThemeModeFromIndex(widget.get_selected()));
    });

    let descriptionLabel = new Gtk.Label({
        label: "Pin your simple notes as notification.",
        xalign: 0,
        wrap: true
    });
    
    let sourceLinkButton = new Gtk.LinkButton({
        uri: 'https://github.com/cankurttekin/PinIt-Gnome-Extension',
        label: 'Source'
    });
    
    let licenseLinkButton = new Gtk.LinkButton({
        uri: 'https://www.gnu.org/licenses/gpl-3.0',
        label: 'License - GPLv3'
    });
    
    vbox.append(themeLabel)
    vbox.append(themeDropDown)
    vbox.append(descriptionLabel)
    vbox.append(sourceLinkButton)
    vbox.append(licenseLinkButton)
    frame.append(vbox)
    frame.show();
    return frame;
}


function _getThemeModeIndex() {
    const themeMode = this.settings.get_string('theme-mode');
    if (themeMode === 'system') {
        return 0;
    } else if (themeMode === 'light') {
        return 1;
    } else if (themeMode === 'dark') {
        return 2;
    } else {
        return 3;
    }
}

function _getThemeModeFromIndex(index) {
    if (index == 0) {
        return 'system';
    } else if (index == 1) {
        return 'light';
    } else if (index == 2) {
        return 'dark';
    } else {
        return 'oled';
    }
}
