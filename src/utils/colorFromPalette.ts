export const colorFromPalette = (paletteSize: number, position: number) => {
	const hueDistance = Math.trunc(360 / paletteSize);
	const baseHue = 0;
	const baseSat = 50;
	const baseLight = 55;

	return `hsl(${(hueDistance * position + baseHue) % 360}, ${fit(baseSat)}%, ${fit(baseLight)}%)`;
};

const fit = (n: number) => (n = n > 100 ? 100 : n < 0 ? 0 : n);
