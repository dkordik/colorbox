var fs = require('fs');
var ColorBox = require("./index");

var ColorBoxDebug = {

	renderColor: function(rgb, customText) {
		return "<div style='background-color:rgb("+
			rgb[0]+","+rgb[1]+","+rgb[2]+
		")'>"+
		ColorBox.whatColorAmI(rgb)+ " " +
			"<span class='metadata'>" +
				(customText == undefined ? "" : customText) +
			"</span>" +
		"</div>";
	},

	renderTestbed: function(imageUrl, colors) {
		var contents = "<html><head>"+
			"<style>"+
			" body {color:#fff; font-size: 13px; font-family: Arial; margin: 0; max-width: 200px; }"+
			" div { padding: 6px; }"+
			" img { width: 100%; }"+
			" .metadata { font-size: 0.7em; text-transform: uppercase; opacity:0.3; }"+
			"</style>"+
			"</head><body>" +
			"<img src='" + imageUrl + "'>" +
			ColorBox.getBaseAndAccentColor(colors).map(function (color, i) {
				var text = (i == 0 ? "base color" : "accent color")
				return ColorBoxDebug.renderColor(color, text);
			}).join("") +
			"<br/>" +
			colors.map(ColorBoxDebug.renderColor).join("") +
			"</body></html>"

		fs.writeFile("./index.html", contents, function(err) {
			if (err) return console.log(err);
			console.log("Rendered.");
		});

	}
}

var imageUrl;
imageUrl = "https://consequenceofsound.files.wordpress.com/2015/02/braids-deep-in-the-iris.jpg?w=806&h=806";
imageUrl = "http://a2.mzstatic.com/us/r30/Music/v4/ca/07/78/ca077842-b7e6-48d7-60ac-fdbd3bc637cc/677517007763.1200x1200-75.jpg";
imageUrl = "http://a3.mzstatic.com/us/r30/Music6/v4/44/68/42/4468426b-e5b3-ba9d-c5be-d6b1473c4e18/FCL99_1600.1200x1200-75.jpg";
imageUrl = "http://a1.mzstatic.com/us/r30/Music/v4/cd/b0/a3/cdb0a392-716b-554c-d851-a76837208439/656605512662.1200x1200-75.jpg";

ColorBox.getDominantColorsFromImageByUrl(imageUrl, function(colors) {
	ColorBoxDebug.renderTestbed(imageUrl, colors);
}); 
