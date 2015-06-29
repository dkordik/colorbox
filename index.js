var fs = require('fs');
var request = require('request');
var imagemagick = require('imagemagick-native');
var crypto = require('crypto');

var ColorBox = {

	minVal: function(arr) {
		return Math.min.apply(null, arr);
	},

	maxVal: function(arr) {
		return Math.max.apply(null, arr);
	},

	getColorType: function(rgb) {
		//TODO: increase granularity to include CMY?
		var min = ColorBox.minVal(rgb);
		var max = ColorBox.maxVal(rgb);
		//init to RGB
		var RGB = { 0: "R", 1: "G", 2: "B" };
		var colorType = RGB[ rgb.indexOf(max) ];

		return colorType;
	},

	getLumSatValue: function(rgb) {
		var luminosity = ColorBox.maxVal(rgb);
		var saturation = (luminosity - ColorBox.minVal(rgb)) / luminosity;
		if ( luminosity == 0 ) {
			return 0;
		} else {
			return luminosity + Math.round(saturation * 255);
		}
	},

	sortByLumSat: function(colors) {
		return colors.slice(0).sort(function (a, b) {
			return ColorBox.getLumSatValue(b) - ColorBox.getLumSatValue(a);
		});
	},

	isGrayish: function(rgb) {
		return (ColorBox.minVal(rgb) + 5)> ColorBox.maxVal(rgb);
	},

	getMostFrequentColorType: function(colors) {
		var tally = {};
		var count = 0;
		var mostCommon = "";

		colors.forEach(function(color) {
			var val = ColorBox.getColorType(color);
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
		var mostFrequentColorType = ColorBox.getMostFrequentColorType(colors);
		var firstFrequentColor = colors.filter(function(color) {
			return ColorBox.getColorType(color) == mostFrequentColorType;
		})[0];

		return firstFrequentColor;
	},

	requestDominantColorsFromImageByUrl: function(imageUrl, callback) {
		var tempFilename = ".temp-" + crypto.createHash('md5').update(imageUrl).digest('hex');
		request(imageUrl)
		.pipe(fs.createWriteStream(tempFilename))
		.on('close', function() {
			fs.readFile(tempFilename, function (err, data) {
				fs.unlink(tempFilename);

				if (err) return callback(err);

				try {
					var quantizedColors = imagemagick.quantizeColors({
						srcData: data,
						colors: 256
					}).map(function(color) {
						return [ color.r, color.g, color.b ]
					});
				} catch (e) {
					return callback(e);
				}

				callback(null, quantizedColors);
			});
		});
	},

	getBaseColor: function (colors) {
		return ColorBox.getFirstFrequentColor(colors);
	},

	getAccentColor: function (colors) {
		var colorsByLumSat = ColorBox.sortByLumSat(colors);
		var baseColor = ColorBox.getBaseColor(colors);
		return colorsByLumSat[0];
	},

	getBaseAndAccentColor: function(colors) {
		var baseColor = ColorBox.getBaseColor(colors);
		var accentColor = ColorBox.getAccentColor(colors);

		return [ baseColor, accentColor ];
	},

	requestBaseAndAccentColorFromImageByUrl: function (imageUrl, callback) {
		ColorBox.requestDominantColorsFromImageByUrl(imageUrl, function (colors) {
			var baseAndAccentColor = ColorBox.getBaseAndAccentColor(colors);
			callback(baseAndAccentColor);
		});
	}
}

module.exports = ColorBox;


