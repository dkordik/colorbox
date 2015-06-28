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

	getLumSatValue:  function(rgb) {
		var luminosity = ColorBox.maxVal(rgb);
		var saturation = (luminosity - ColorBox.minVal(rgb)) / luminosity;
		if ( luminosity == 0 ) {
			return 0;
		} else {
			return luminosity + Math.round(saturation * 255);
		}
	},

	//TODO: sort by unique
	//TODO: sort by most common color

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
		var baseColor = ColorBox.getFirstFrequentColor(colors);

		var accentColor = ColorBox.sortByLumSat(colors).filter(function (color) {
			//filter to next best color that's different
			return ColorBox.whatColorAmI(color) != ColorBox.whatColorAmI(baseColor);
		})[0];

		return [ baseColor, accentColor ];
	},

	isGrayish: function(rgb) {
		return (ColorBox.minVal(bestColor) + 5)> ColorBox.maxVal(bestColor);
	}
}

module.exports = ColorBox;


