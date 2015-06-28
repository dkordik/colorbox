var fs = require('fs');
var request = require('request');
var imagemagick = require('imagemagick-native')

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

	getDominantColorsFromImageByUrl: function(imageUrl, callback) {
		request(imageUrl)
		.pipe(fs.createWriteStream('.temp'))
		.on('close', function() {
			fs.readFile('.temp', function (err, data) {
				if (err) throw err;

				var quantizedColors = imagemagick.quantizeColors({
					srcData: data,
					colors: 256
				}).map(function(color) {
					return [ color.r, color.g, color.b ]
				});
				if (callback) {
					callback(quantizedColors);
				}
			});
		});
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

var imageUrl;
imageUrl = "https://consequenceofsound.files.wordpress.com/2015/02/braids-deep-in-the-iris.jpg?w=806&h=806";

ColorBox.getDominantColorsFromImageByUrl(imageUrl, function(colors) {
	ColorBox.renderTestbed(imageUrl, colors);
}); 



