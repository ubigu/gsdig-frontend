const rgb2arr = (rgb: string): number[] => {
    if (!rgb) {
        return [];
    }
    rgb = rgb.substring(1);
    return [
        parseInt(rgb.substring(0, 2), 16),
        parseInt(rgb.substring(2, 4), 16),
        parseInt(rgb.substring(4, 6), 16),
    ];
};
export default rgb2arr;