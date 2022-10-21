import React from 'react';
import { useTranslations } from '@src/translation/TranslationContext';
import ArealDivisionMetadata from '../interfaces/ArealDivisionMetadata';
import { Checkbox, Fab, FormControl, FormControlLabel, FormGroup, Grid, Input, InputLabel, makeStyles, MenuItem, Paper, Select, Tooltip, Typography } from '@material-ui/core';
import VectorSource from 'ol/source/Vector';
import { Edit } from '@material-ui/icons';
import StyleRule from '@src/interfaces/StyleRule';
import { getNaturalBreaks } from '@src/utils/jenks';
import Style, { StyleLike } from 'ol/style/Style';
import colorSets from '@src/utils/colorsets';
import rgb2arr from '@src/utils/color';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Feature } from 'ol';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(1),
    minWidth: 180
  },
  formControl: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  legend: {
    padding: theme.spacing(1)
  },
}));

const getUniqueValuesAndCounts = (sorted: any[], limit: number) : { value: any, count: number }[] => {
  const result: { value: any, count: number }[] = [];
  let a = sorted[0];
  let j = 0;
  const len = sorted.length;
  for (let i = 1; i < len; i++) {
    const b = sorted[i];
    if (a != b) {
      result.push({ value: a, count: i - j });
      if (result.length === limit) {
        return result;
      }
      a = b;
      j = i;
    }
  }
  result.push({ value: a, count: len - j });
  return result;
}

const colorset2img = (rgbs: number[][]): string => {
  const n = rgbs.length;
  const m = 5;
  const w = 100 / n;
  const h = 20;
  const c = document.createElement('canvas');
  c.width = w * n + 2 * m;
  c.height = h + 2 * m;
  const ctx = c.getContext("2d");
  if (!ctx) {
    return "";
  }
  for (let i = 0, x = m; i < n; i++, x += w) {
    const rgb = rgbs[i];
    ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.fillRect(x, m, w, h);
  }
  ctx.strokeRect(m, m, w * n, h);
  return c.toDataURL("image/png");
}

const getFeatureCountPerGroup = (sorted: number[], breakPoints: number[]) => {
  const arr: number[] = [];
  const n = sorted.length;

  // => i marks the start of each group
  // => j marks the current index we're looking at
  let i = 0;
  let j = 0;

  // Iterate over breakPoints (which include the minimum and maximum value of  the dataset)
  // e.g: [minValue, bp1, bp2, bp3, bp4, bp5, maxValue] (bp = breakPoint)
  for (let k = 1; k < breakPoints.length - 1; k++) {
    const breakPoint = breakPoints[k];
    // When we reach a value >= current breakPoint we stop
    while (sorted[j] < breakPoint) {
      j++;
    }
    // Group size can be calculated with (j - i)
    arr.push(j - i);
    i = j;
  }
  // After last actual breakPoint (not the maxValue) is reached the
  // size of last group can be calculated with (n - i)
  // as all other values are >= last breakPoint but <= maxValue
  // where n is the size of the dataset 
  // and   i is now the index of last breakPoint
  // 
  arr.push(n - i);

  return arr;
}

const getStyleIndexFunctionUniq = (prop: string, groups: number[]): (f: Feature) => number => {
  return f => {
    const v = f.get(prop);
    if (!v) {
      return -1;
    }
    for (let i = 0; i < groups.length; i++) {
      if (v === groups[i]) {
        return i;
      }
    }
    return -1;
  }
}

const getStyleIndexFunction = (prop: string, ends: number[]): (f: Feature) => number => {
  return f => {
    const v = f.get(prop);
    if (!v) {
      return -1;
    }
    const end = ends.length - 1;
    for (let i = 0; i < end; i++) {
      if (v < ends[i]) {
        return i;
      }
    }
    // breakPoints[len - 1] is maxValue, no need to test for that
    // value is larger than last actual breakPoint at breakPoints[len - 2]
    // => return last index
    return end;
  }
}

interface Props {
  selected: ArealDivisionMetadata,
  features: VectorSource,
  onStyleChange: (style: StyleLike | undefined) => void,
}

export default function StyleEditor({
  selected,
  features,
  onStyleChange
} : Props) {
  const { tr } = useTranslations();
  const classes = useStyles();

  const [edit, setEdit] = React.useState<boolean>(false);

  const [properties, setProperties] = React.useState<{ key: string, title: string }[]>([]);
  const [property, setProperty] = React.useState<string>();
  
  const [featureData, setFeatureData] = React.useState<{ sorted: any[], countNull: number }>();

  const [k, setK] = React.useState<number>(5);

  const [groups, setGroups] = React.useState<{ min: number, max?: number, count: number }[]>();
  
  const [distribution, setDistribution] = React.useState<'div' | 'seq' | 'qual'>('seq');
  const [distributionColorsets, setDistributionColorsets] = React.useState<{ name: string, colors: number[][][]}[]>();
  const [selectedColorset, setSelectedColorset] = React.useState<{ name: string, colors: number[][][]}>();
  const [reverse, setReverse] = React.useState<boolean>(false);
  
  const [drawNoValue, setDrawNoValue] = React.useState<boolean>(false);
  const [noValueRGB, setNoValueRGB] = React.useState<string>("#999999");

  const [numberOfDecimals, setNumberOfDecimals] = React.useState<number>(1);
  
  const [rules, setRules] = React.useState<StyleRule[]>();

  React.useEffect(() => {
    if (!edit) {
      setRules(undefined);
    }
    if (selected) {
      const props = Object.entries(selected.attributes).map(([key, info]) => ({key: key, title: info.title }));
      setProperties(props);
      setProperty(prev => prev ? props.find(prop => prop.key === prev)?.key : props[0]?.key);
    }
  }, [selected]);

  React.useEffect(() => {
    if (!features || !property) {
      setFeatureData(null);
      return;
    }

    const data: any[] = [];
    let count = 0;
    features.forEachFeature(f => {
      const v = f.get(property);
      if (v) {
        data.push(v);
      }
      count++;
    });
    data.sort((a, b) => +(a > b) || -(a < b));

    setFeatureData({ sorted: data, countNull: count - data.length });
  }, [features, property]);

  React.useEffect(() => {
    if (!featureData) {
      setRules(null);
      return;
    }

    const data = featureData.sorted;

    const uniqueValuesAndCounts = getUniqueValuesAndCounts(data, k + 1);
    if (uniqueValuesAndCounts.length < k) {
      setK(uniqueValuesAndCounts.length);
      return;
    }

    const groups : { min: any, max?: number, count: number }[] = [];
    if (uniqueValuesAndCounts.length == k) {
      for (let i = 0; i < k; i++) {
        groups.push({ min: uniqueValuesAndCounts[i].value, count: uniqueValuesAndCounts[i].count });
      }
    } else {
      
      const breaks = getNaturalBreaks(data, k);
      const counts = getFeatureCountPerGroup(data, breaks);
      for (let i = 0; i < counts.length; i++) {
        groups.push({ min: breaks[i], max: breaks[i + 1], count: counts[i] });
      }
    }

    setGroups(groups);
  }, [featureData, k]);

  
  React.useEffect(() => {
    const distributionColorsets = colorSets.filter(cs => cs.type === distribution);
    setDistributionColorsets(distributionColorsets);

    if (!selectedColorset || !distributionColorsets.some(cs => cs.name === selectedColorset.name)) {
      setSelectedColorset(distributionColorsets[0]);
    }
  }, [distribution]);

  React.useEffect(() => {
    if (!property || !groups || !selectedColorset) {
      return;
    }

    const nullColor = rgb2arr(noValueRGB);
    const nullStyle = !drawNoValue ? undefined : new Style({
      fill: new Fill({ color: nullColor }),
      stroke: new Stroke()
    });

    if (k === 0) {
      // No values at all, only noValues
      onStyleChange(nullStyle);
      setRules([]);
      return;
    }
    
    if (k === 1) {
      // Single value shared with all features (possibly noValues)
      const color = selectedColorset.colors[0][0];
      const style = new Style({
        fill: new Fill({ color: selectedColorset.colors[0][reverse ? -1 : 0] }),
        stroke: new Stroke()
      });
      onStyleChange((f: Feature) => f.get(property) ? style : nullStyle);
      setRules(groups.map(g => (
        {
          color: color,
          min: g.min,
          count: g.count
        }
      )));
      return;
    }

    let colors = selectedColorset.colors.find(it => it.length === k);
    if (reverse) {
      colors = [...colors].reverse();
    }

    const unique = groups.every(g => !g.max);
    
    const getStyleIndex = unique
      ? getStyleIndexFunctionUniq(property, groups.map(g => g.min))
      : getStyleIndexFunction(property, groups.map(g => g.max));

    const styles = colors.map(color =>
      new Style({
        fill: new Fill({ color: color }),
        stroke: new Stroke()
      })
    );

    const olStyle = (f: Feature) => {
      const i = getStyleIndex(f);
      return i < 0 ? nullStyle : styles[i];
    };

    onStyleChange(olStyle);
    setRules(groups.map((group, i) => (
      {
        color: colors[i],
        min: group.min,
        max: group.max,
        count: group.count
      }
    )));
    
  }, [groups, selectedColorset, reverse, drawNoValue, noValueRGB]);

  if (!selected) {
    return <></>
  }
  return (
    <Paper className={classes.container}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Typography>{selected.title}</Typography>
        <Tooltip title={edit ? tr.StyleEditor.tooltipEditClose : tr.StyleEditor.tooltipEditOpen}>
          <Fab
            size='small'
            color={edit ? "primary" : "inherit"}
            onClick={() => setEdit(prev => !prev)}
          >
            <Edit fontSize='small' />
          </Fab>
        </Tooltip>
      </Grid>

      {edit && 
      <FormGroup>
        <FormControl className={classes.formControl}>
          <InputLabel shrink>{tr.StyleEditor.property}</InputLabel>
          <Select value={property || ''} onChange={(e) => setProperty(e.target.value as string)}>
            {properties.map(p => <MenuItem key={p.key} value={p.key}>{p.title}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel shrink>{tr.StyleEditor.numberOfClasses}</InputLabel>
          <Select value={k} onChange={(e) => setK(e.target.value as number)}>
            {[...Array(10)].map((_, i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel shrink>{tr.StyleEditor.distribution}</InputLabel>
          <Select value={distribution} onChange={(e) => setDistribution(e.target.value as 'div' | 'seq' | 'qual')}>
            <MenuItem value={'div'}>{tr.StyleEditor.diverging}</MenuItem>
            <MenuItem value={'seq'}>{tr.StyleEditor.quantitative}</MenuItem>
            <MenuItem value={'qual'}>{tr.StyleEditor.qualitative}</MenuItem>
          </Select>
        </FormControl>

        {selectedColorset && distributionColorsets && k > 1 &&
        <div className={classes.formControl}>
          <FormControl>
            <Select value={selectedColorset.name} onChange={(e) => setSelectedColorset(distributionColorsets.find(it => it.name === e.target.value as string))}>
              {distributionColorsets.map(colorset =>
                <MenuItem key={colorset.name} value={colorset.name}>
                  {reverse 
                  ? <img src={colorset2img([...colorset.colors.find(it => it.length === k)].reverse())} />
                  : <img src={colorset2img(colorset.colors.find(it => it.length === k))} />
                  }
                </MenuItem>)
              }
            </Select>
          </FormControl>
          <FormControlLabel
            label={tr.StyleEditor.reverse}
            control={<Checkbox checked={reverse} onChange={(_, checked) => setReverse(checked)} />}
          />
        </div>
        }

        <FormControlLabel
          label={tr.StyleEditor.showNoValue}
          control={<Checkbox checked={drawNoValue} onChange={(_, checked) => setDrawNoValue(checked)} />}
        />
        <FormControl className={classes.formControl}>
          <InputLabel shrink>{tr.StyleEditor.noValueColor}</InputLabel>
          <Input disabled={!drawNoValue} type="color" value={noValueRGB} onChange={e => setNoValueRGB(e.target.value)} />
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel shrink>{tr.StyleEditor.numberOfDecimals}</InputLabel>
          <Select value={numberOfDecimals} onChange={(e) => setNumberOfDecimals(e.target.value as number)}>
            <MenuItem value={0}>0</MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
          </Select>
        </FormControl>
      </FormGroup>
      }

      <div className={classes.legend}>
        <Typography>{tr.StyleEditor.legend}</Typography> 
        {rules?.map((rule, index) =>
        <Grid key={`rule-${index}`} container alignItems="center" justifyContent="space-between">
          <img src={color2legendimg(rule.color)} />
          <span>
            {rule.max && rule.min
              ? `${format(rule.min, numberOfDecimals)} - ${format(rule.max, numberOfDecimals)}`
              : isNaN(rule.min) ? rule.min : format(rule.min, numberOfDecimals)
            }
            {` [${rule.count}]`}
          </span>
        </Grid>
        )}
        {drawNoValue && featureData &&
        <Grid container alignItems="center" justifyContent="space-between">
          <img src={color2legendimg(rgb2arr(noValueRGB))} />
          <span>{`${tr.StyleEditor.noValue} [${featureData.countNull}]`}</span>
        </Grid>
        }
      </div>

    </Paper>
  )
}

const color2legendimg = (rgb: number[]): string => {
  const m = 5;
  const w = 25;
  const h = 20;
  const c = document.createElement('canvas');
  c.width = w + 2 * m;
  c.height = h + 2 * m;
  const ctx = c.getContext("2d");
  if (rgb) {
    ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.fillRect(m, m, w, h);
  }
  ctx.strokeRect(m, m, w, h);
  return c.toDataURL("image/png");
}

const format = (value: number, decimals: number): string => {
  const formatter = new Intl.NumberFormat('fi-FI', {
    minimumFractionDigits: decimals,      
    maximumFractionDigits: decimals,
 });
 return formatter.format(value);
}