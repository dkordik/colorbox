var fs = require('fs');
var ColorBox = require("./index");

var ColorBoxDebugger = {

	renderColor: (rgb, customText) => {
		return "<div style='background-color:rgb("+
			rgb[0]+","+rgb[1]+","+rgb[2]+
		")'>"+
			ColorBox.getColorType(rgb)+ " " +
			"<span class='metadata'>" +
				(customText == undefined ? "" : customText) +
			"</span>" +
		"</div>";
	},

	renderTestColumn: (imageUrl, colors) => {
		return "<div class='col'>" +
			"<img src='" + imageUrl + "'>" +
			ColorBox.getBaseAndAccentColor(colors).map((color, i) => {
				var text = (i == 0 ? "base color" : "accent color")
				return ColorBoxDebugger.renderColor(color, text);
			}).join("") +
			"<br/>" +
			"<span class='allcolors'>" +
			colors.map(ColorBoxDebugger.renderColor).join("") +
			"</span>" +
		"</div>"
	},

	renderTestbed: (imageUrls) => {
		var output = "<html><head>"+
			"<style>"+
			" body { color: #fff; font-size: 13px; font-family: Arial; "+
				"margin: 0; white-space: nowrap; overflow: auto; }"+
			" div { padding: 6px; }"+
			" img { width: 100%; }"+
			" .col { display: inline-block; max-width: 200px; }"+
			" .metadata { font-size: 0.8em; text-transform: uppercase; opacity:0.3; }"+
			" .allcolors div { width: 10px; display: inline-block; text-align: center; }"+
			" .allcolors { max-width: 100%; white-space: normal; }"+
			" .allcolors .metadata { font-size: 0.5em; }"+
			"</style>"+
			"</head><body>";
		var unresolvedImages = imageUrls.length;

		imageUrls.forEach((imageUrl) => {
			ColorBox.requestDominantColorsFromImageByUrl(imageUrl)
				.then((colors) => {
					unresolvedImages--;
					output += ColorBoxDebugger.renderTestColumn(imageUrl, colors);

					if (unresolvedImages == 0) {
						output += "</body></html>";
						fs.writeFile("./index.html", output, (err) => {
							if (err) return console.error(err);
							console.log("Rendered.");
						});
					}
				})
				.catch((err) => {
					console.error("Error with " + imageUrl + "\n", err);
				});
		})
	}
}

var imageUrls = [
  "https://images.unsplash.com/photo-1521133573892-e44906baee46?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80",
	"https://images.unsplash.com/photo-1560942800-87cef0f0bc92?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80",
	"https://images.unsplash.com/photo-1467164616789-ce7ae65ab4c9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80"
];

ColorBoxDebugger.renderTestbed(imageUrls);
