var fs = require('fs');
var request = require('request');
var imagemagick = require('imagemagick-native');
var crypto = require('crypto');

var ColorBox = {

	minVal: (arr) => {
		return Math.min.apply(null, arr);
	},

	maxVal: (arr) => {
		return Math.max.apply(null, arr);
	},

	getColorType: (rgb) => {
		//TODO: increase granularity to include CMY?
		var min = ColorBox.minVal(rgb);
		var max = ColorBox.maxVal(rgb);
		//init to RGB
		var RGB = { 0: "R", 1: "G", 2: "B" };
		var colorType = RGB[ rgb.indexOf(max) ];

		return colorType;
	},

	getLumSatValue: (rgb) => {
		var luminosity = ColorBox.maxVal(rgb);
		var saturation = (luminosity - ColorBox.minVal(rgb)) / luminosity;
		if ( luminosity == 0 ) {
			return 0;
		} else {
			return luminosity + Math.round(saturation * 255);
		}
	},

	sortByLumSat: (colors) => {
		return colors.slice(0).sort((a, b) => {
			return ColorBox.getLumSatValue(b) - ColorBox.getLumSatValue(a);
		});
	},

	isGrayish: (rgb) => {
		return (ColorBox.minVal(rgb) + 5)> ColorBox.maxVal(rgb);
	},

	getMostFrequentColorType: (colors) => {
		var tally = {};
		var count = 0;
		var mostCommon = "";

		colors.forEach((color) => {
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

	getFirstFrequentColor: (colors) => {
		var mostFrequentColorType = ColorBox.getMostFrequentColorType(colors);
		var firstFrequentColor = colors.filter((color) => {
			return ColorBox.getColorType(color) == mostFrequentColorType;
		})[0];

		return firstFrequentColor;
	},

	requestDominantColorsFromImageByUrl: (imageUrl) => {
		return new Promise((resolve, reject) => {
			var tempFilename = ".temp-" + crypto.createHash('md5').update(imageUrl).digest('hex');

			request(imageUrl)
				.pipe(fs.createWriteStream(tempFilename))
				.on('close', () => {
					fs.readFile(tempFilename, (err, data) => {
						fs.unlink(tempFilename, () => {});

						if (err) {
							console.error('Error reading image file...', imageUrl, err);
							reject(err);
						}

						var quantizedColors = imagemagick.quantizeColors({
							srcData: data,
							colors: 256
						}).map(color => [ color.r, color.g, color.b ]);

						if (quantizedColors) {
							resolve(quantizedColors);
						} else {
							reject();
						}
					});
				});
		});
	},

	getBaseColor: (colors) => {
		return ColorBox.getFirstFrequentColor(colors);
	},

	getAccentColor: (colors) => {
		var colorsByLumSat = ColorBox.sortByLumSat(colors);
		var baseColor = ColorBox.getBaseColor(colors);
		return colorsByLumSat[0];
	},

	getBaseAndAccentColor: (colors) => {
		var baseColor = ColorBox.getBaseColor(colors);
		var accentColor = ColorBox.getAccentColor(colors);

		return [ baseColor, accentColor ];
	},

	requestBaseAndAccentColorFromImageByUrl: (imageUrl) => {
		return ColorBox.requestDominantColorsFromImageByUrl(imageUrl)
			.then((colors) => {
				var baseAndAccentColor = ColorBox.getBaseAndAccentColor(colors);
				return ColorBox.getBaseAndAccentColor(colors);
			})
			.catch((err) => {
				console.error('Error loading colors from image. err:', err);
			});
	}
}

module.exports = ColorBox;
