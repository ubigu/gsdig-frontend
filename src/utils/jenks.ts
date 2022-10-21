/**
 * Ported from Go version
 * @see https://github.com/ThinkingLogic/jenks
 * itself ported from JS-version
 * @see https://gist.github.com/tmcw/4977508
 */
export const getNaturalBreaks = (sorted: number[], nClasses: number) : number[] => {
  const { lowerClassLimits } = getMatrices(sorted, nClasses);
  return breaks(sorted, lowerClassLimits, nClasses);
}

const getMatrices = (data: number[], nClasses: number) : { lowerClassLimits: Uint32Array, varianceCombinations: Float64Array } => {
  const x = data.length + 1;
  const y = nClasses + 1;

  const lowerClassLimits = new Uint32Array(x * y);
  const varianceCombinations = new Float64Array(x * y);

  const idx = (i: number, j: number): number => (i * y) + j;

  for (let i = 1; i < y; i++) {
    const index = idx(1, i);
    lowerClassLimits[index] = 1;
    varianceCombinations[index] = 0;

    for (let j = 2; j < x; j++) {
      varianceCombinations[idx(j, i)] = Number.MAX_VALUE;
    }
  }
  
  for (let l = 2; l < x; l++) {
    const i1 = idx(l, 0);

    let s = 0.0;
    let ss = 0.0;
    let w = 0.0;
    let variance = 0.0;
    
    for (let m = 1; m < l+1; m++) {

      const lowerClassLimit = l - m + 1;
      const currentIndex = lowerClassLimit - 1;
      const val = data[currentIndex];

      w++;

      s += val;
      ss += val * val;

      variance = ss - (s * s) / w;
      if (currentIndex != 0) {
        const i2 = idx(currentIndex, 0);

        for (let j = 2; j < y; j++) {
          const j1 = i1 + j;
          const j2 = i2 + j - 1;

          const v1 = varianceCombinations[j1];
          const v2 = varianceCombinations[j2] + variance;
          
          if (v1 >= v2) {
            lowerClassLimits[j1] = lowerClassLimit;
            varianceCombinations[j1] = v2;
          }
        }
      }
    }

    const index = idx(l, 1);
    lowerClassLimits[index] = 1;
    varianceCombinations[index] = variance;
  }

  return { lowerClassLimits: lowerClassLimits, varianceCombinations: varianceCombinations };
}

const breaks = (data: number[], lowerClassLimits: Uint32Array, nClasses: number): number[] => {
  const classBoundaries = [];

  const y = nClasses + 1;
  let j = data.length - 1;
  
  classBoundaries.push(data[j]);
  for (let i = nClasses; i > 1; i--) {
    j = lowerClassLimits[(j * y) + i] - 1;
    classBoundaries.push(data[j]);
  }
  classBoundaries.push(data[0]);

  return classBoundaries.reverse();
}
