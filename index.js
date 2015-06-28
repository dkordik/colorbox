var fs = require('fs');

var ColorBox = {

	minVal: function(arr) {
		return Math.min.apply(null, arr);
	},

	maxVal: function(arr) {
		return Math.max.apply(null, arr);
	},

	whatColorAmI: function(rgb) {
		//TODO: increase granularity to include CMY, beyond
		var RGB = { 0: "R", 1: "G", 2: "B" };
		var index = rgb.indexOf( ColorBox.maxVal(rgb) );
		return RGB[index];
	},

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

	getLumSatValue:  function(rgb) {
		var luminosity = ColorBox.maxVal(rgb);
		var saturation = (luminosity - ColorBox.minVal(rgb)) / luminosity;
		if ( luminosity == 0 ) {
			return 0;
		} else {
			return luminosity + Math.round(saturation * 255);
		}
	},

	//sort by unique
	//sort by most common color

	sortByLumSat: function(colors) {
		return colors.slice(0).sort(function (a, b) {
			return ColorBox.getLumSatValue(b) - ColorBox.getLumSatValue(a);
		});
	},

	getMostFrequentColorType: function(colors) {
		var tally = {};
		var count = 0;
		var mostCommon = "";

		colors.forEach(function(color) {
			var val = ColorBox.whatColorAmI(color);
			if (!tally[val]) {
				tally[val] = 1;
			} else {
				tally[val] += 1;
			}

			if (tally[val] > count) {
				count = tally[val];
				mostCommon = val;
			}

		});

		return mostCommon;
	},

	getFirstFrequentColor: function(colors) {
		var mostFrequentColor = ColorBox.getMostFrequentColorType(colors);
		var firstFrequentColor = colors.filter(function(color) {
			return ColorBox.whatColorAmI(color) == mostFrequentColor;
		})[0];

		return firstFrequentColor;
	},

	//putting it all together...
	getBaseAndAccentColor: function(colors) {
		var colorsByLumSat = ColorBox.sortByLumSat(colors);
		var baseColor = ColorBox.getFirstFrequentColor(colors);//colors[0]; //colorsByLumSat[0];

		var accentColor = ColorBox.sortByLumSat(colors).filter(function (color) {
			//filter to next best color that's different
			return ColorBox.whatColorAmI(color) != ColorBox.whatColorAmI(baseColor);
		})[0];

		return [ baseColor, accentColor ];
	},

	isGrayish: function(rgb) {
		return (ColorBox.minVal(bestColor) + 5)> ColorBox.maxVal(bestColor);
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
				return ColorBox.renderColor(color, text);
			}).join("") +
			"<br/>" +
			colors.map(ColorBox.renderColor).join("") +
			"</body></html>"

		fs.writeFile("./index.html", contents, function(err) {
			if (err) return console.log(err);
			console.log("Rendered.");
		});

	}
}

var colors = [[47, 61, 31],
[24, 36, 18], [4, 8, 3], [23, 32, 19], [97, 100, 66], [38, 46, 22], [65, 72, 40],
[9, 17, 8], [25, 32, 11], [17, 24, 10], [15, 18, 12], [100, 25, 16], [75, 84, 40],
[6, 15, 4], [40, 60, 11], [158, 150, 115]];



ColorBox.getFirstFrequentColor(colors);

// ColorBox.sortByLumSat(colors);

var imageUrl = "https://consequenceofsound.files.wordpress.com/2015/02/braids-deep-in-the-iris.jpg?w=806&h=806";

ColorBox.renderTestbed(imageUrl, colors);


