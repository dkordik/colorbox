var fs = require('fs');
var ColorBox = require("./index");

var ColorBoxDebugger = {

	renderColor: function(rgb, customText) {
		return "<div style='background-color:rgb("+
			rgb[0]+","+rgb[1]+","+rgb[2]+
		")'>"+
			ColorBox.getColorType(rgb)+ " " +
			"<span class='metadata'>" +
				(customText == undefined ? "" : customText) +
			"</span>" +
		"</div>";
	},

	renderTestColumn: function (imageUrl, colors) {
		return "<div class='col'>" +
			"<img src='" + imageUrl + "'>" +
			ColorBox.getBaseAndAccentColor(colors).map(function (color, i) {
				var text = (i == 0 ? "base color" : "accent color")
				return ColorBoxDebugger.renderColor(color, text);
			}).join("") +
			"<br/>" +
			colors.map(ColorBoxDebugger.renderColor).join("") +
		"</div>"
	},

	renderTestbed: function(imageUrls) {
		var output = "<html><head>"+
			"<style>"+
			" body { color: #fff; font-size: 13px; font-family: Arial; "+
				"margin: 0; white-space: nowrap; overflow: auto; }"+
			" div { padding: 6px; }"+
			" img { width: 100%; }"+
			" .col { display: inline-block; max-width: 200px; }"+
			" .metadata { font-size: 0.7em; text-transform: uppercase; opacity:0.3; }"+
			"</style>"+
			"</head><body>";
		var unresolvedImages = imageUrls.length;

		imageUrls.forEach(function (imageUrl) {
			ColorBox.requestDominantColorsFromImageByUrl(imageUrl, function (err, colors) {
				if (err) return console.error("Error with " + imageUrl + "\n", err);
				unresolvedImages--;
				output += ColorBoxDebugger.renderTestColumn(imageUrl, colors)

				if (unresolvedImages == 0) {
					output += "</body></html>";
					fs.writeFile("./index.html", output, function(err) {
						if (err) return console.error(err);
						console.log("Rendered.");
					});
				}
			})
		})
	}
}

var imageUrls = [
	"https://consequenceofsound.files.wordpress.com/2015/02/braids-deep-in-the-iris.jpg?w=806&h=806",
	"http://a2.mzstatic.com/us/r30/Music/v4/ca/07/78/ca077842-b7e6-48d7-60ac-fdbd3bc637cc/677517007763.1200x1200-75.jpg",
	"http://a3.mzstatic.com/us/r30/Music6/v4/44/68/42/4468426b-e5b3-ba9d-c5be-d6b1473c4e18/FCL99_1600.1200x1200-75.jpg",
	"http://a1.mzstatic.com/us/r30/Music/v4/cd/b0/a3/cdb0a392-716b-554c-d851-a76837208439/656605512662.1200x1200-75.jpg",
	"http://a4.mzstatic.com/us/r30/Music2/v4/39/f4/b5/39f4b5d4-ac76-c9f8-f2a4-b9171ad8a7ec/cover1200x1200.jpeg",
	"http://a2.mzstatic.com/us/r30/Music7/v4/bf/fb/06/bffb06e6-9ce7-845b-095a-60fc180bc219/cover1200x1200.jpeg",
	"http://a2.mzstatic.com/us/r30/Music3/v4/a8/15/1d/a8151d4b-031f-58de-22b6-e075574d3355/cover1200x1200.jpeg",
	"http://a2.mzstatic.com/us/r30/Music1/v4/7f/05/7d/7f057d61-5e72-38fd-b26c-5f84fa7058d7/cover1200x1200.jpeg"
];

ColorBoxDebugger.renderTestbed(imageUrls);
