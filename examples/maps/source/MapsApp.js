enyo.kind({
	name: "MapsApp",
	classes: "app onyx enyo-unselectable",
	components: [
		{kind: "Rows", classes: "enyo-fit", components: [
			{kind: "onyx.Toolbar", classes: "toolbar", components: [
				{kind: "onyx.RadioGroup", defaultKind: "RadioIconButton", components: [
					{icon: "images/topbar-search-icon.png", active: true},
					{icon: "images/topbar-direct-icon.png"}
				]},
				{kind: "onyx.InputDecorator", components: [
					{name: "searchInput", kind: "onyx.Input", defaultFocus: true, classes: "search-input", placeholder: "Search or Address"},
					{kind: "Image", src: "images/search-input-search.png", ontap: "search"}
				]},
				/* using "float: right" to make menu buttons right-aligned */
				{kind: "IconButton", classes: "menu-button", style: "float: right;", icon: "images/menu-icon-mylocation.png", ontap: "findCurrentLocation"},
				{kind: "IconButton", classes: "menu-button", style: "float: right;", icon: "images/menu-icon-bookmark.png", panel: "bookmark", ontap: "togglePullout"},
				{kind: "IconButton", classes: "menu-button", style: "float: right;", icon: "images/menu-icon-info.png", panel: "info", ontap: "togglePullout"}
			]},
			{name: "map", kind: "BingMap", fit: true,
				options: {showDashboard: false, showCopyright: false, showScalebar: false},
				credentials: "Ah2oavKf-raTJYVgMxnxJg9E2E2_53Wb3jz2lD4N415EFSKwFlhlMe9U2dJpMZyJ",
				onLoaded: "findCurrentLocation"}
		]},
		{kind: "Pullout", classes: "pullout",
			onDropPin: "dropPin", onShowTraffic: "showTraffic", onMapTypeSelect: "mapTypeSelect", onBookmarkSelect: "bookmarkSelect"},
		{kind: "Infobox"},
		{kind: "CurrentLocation", onSuccess: "currentLocationSuccess"}
	],
	togglePullout: function(inSender) {
		this.$.pullout.toggle(inSender.panel);
	},
	mapTypeSelect: function(inSender, inEvent) {
		this.$.map.setMapType(inEvent.mapType)
	},
	bookmarkSelect: function(inSender, inItem) {
		var loc = inItem.location;
		this.bookmarkPin = this.$.map.updatePushpin(this.bookmarkPin, loc.latitude, loc.longitude, {icon: "images/poi_search.png", height: 48, width: 48});
		Microsoft.Maps.Events.addHandler(this.bookmarkPin, 'click', enyo.bind(this, "openInfobox", inItem));
		this.$.map.setCenter(loc.latitude, loc.longitude);
	},
	openInfobox: function(inItem, e) {
		var loc = e.target.getLocation();
		var pix = this.$.map.hasMap().tryLocationToPixel(loc, Microsoft.Maps.PixelReference.control);
		this.$.infobox.setTitle(inItem.title);
		this.$.infobox.setDetails(inItem.details);
		this.$.infobox.openAt(pix.y, pix.x + 18);
	},
	dropPin: function(inSender, inEvent) { 
		var loc = this.$.map.hasMap().getCenter();
		this.$.map.setCenter(loc.latitude, loc.longitude);
		this.$.map.setShowPin(inEvent.value);
	},
	showTraffic: function(inSender, inEvent) {
		this.$.map.setShowTraffic(inEvent.value);
	},
	findCurrentLocation: function() {
		this.$.currentLocation.go();
	},
	currentLocationSuccess: function(inSender, inData) {
		var c = inData.coords;
		this.$.map.setCenter(c.latitude, c.longitude);
		this.$.map.setZoom(14);
		inSender.stopTracking();
		this.currentLocationPin = this.$.map.updatePushpin(this.currentLocationPin, c.latitude, c.longitude,
			{icon: "images/mylocation.png", height: 48, width: 48, anchor: new Microsoft.Maps.Point(24, 24)});
	},
	search: function(inSender) {
		this.$.map.clearAll([this.currentLocationPin]);
		if (this.$.searchInput.getValue()) {
			for (var i=0, item; item=mock_data[i]; i++) {
				var loc = item.location;
				var p = this.$.map.createPushpin(loc.latitude, loc.longitude, {icon: "images/poi_search.png", height: 48, width: 48, text: String(i+1), textOffset: new Microsoft.Maps.Point(0, 7)});
				Microsoft.Maps.Events.addHandler(p, 'click', enyo.bind(this, "openInfobox", item));
				this.$.map.setCenter(loc.latitude, loc.longitude);
			}
		}
	}
});
