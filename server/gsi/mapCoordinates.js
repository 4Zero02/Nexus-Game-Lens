/**
 * CS2 Map Coordinates for Radar Calibration
 *
 * pos_x, pos_y: top-left corner of the overview image in engine units
 * scale: units per pixel on the overview image
 *
 * Formula to convert engine position to radar percentage:
 *   radar_x = (engine_x - pos_x) / (scale * imageSize)
 *   radar_y = (pos_y - engine_y) / (scale * imageSize)
 *
 * Standard overview image size is 1024x1024.
 */

const mapCoordinates = {
  de_dust2: { pos_x: -2476, pos_y: 3239, scale: 4.4 },
  de_mirage: { pos_x: -3230, pos_y: 1713, scale: 5.0 },
  de_inferno: { pos_x: -2087, pos_y: 3870, scale: 4.9 },
  de_nuke: { pos_x: -3453, pos_y: 2887, scale: 7.0 },
  de_overpass: { pos_x: -4831, pos_y: 1781, scale: 5.2 },
  de_vertigo: { pos_x: -3168, pos_y: 1762, scale: 4.0 },
  de_ancient: { pos_x: -2953, pos_y: 2164, scale: 5.0 },
  de_anubis: { pos_x: -2796, pos_y: 3328, scale: 5.22 },
};

/**
 * Convert engine world coordinates to radar percentage (0..1)
 * @param {string} mapName - e.g. 'de_dust2'
 * @param {number} x - engine X coordinate
 * @param {number} y - engine Y coordinate
 * @param {number} [imageSize=1024]
 * @returns {{ x: number, y: number } | null}
 */
function engineToRadar(mapName, x, y, imageSize = 1024) {
  const coords = mapCoordinates[mapName];
  if (!coords) return null;
  const { pos_x, pos_y, scale } = coords;
  const totalUnits = scale * imageSize;
  return {
    x: (x - pos_x) / totalUnits,
    y: (pos_y - y) / totalUnits,
  };
}

module.exports = { mapCoordinates, engineToRadar };
