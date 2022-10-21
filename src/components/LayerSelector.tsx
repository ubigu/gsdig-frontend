import React from "react";
import { makeStyles, Slider, TextField, IconButton, Paper, Typography, Grid } from "@material-ui/core";
import { Visibility, VisibilityOff } from '@material-ui/icons';
import Layer from 'ol/layer/Layer';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
  },
}));

const min = 0;
const max = 100;

interface Props {
  mapLayers: Layer[],
  handleVisibilityChange: (layer: Layer) => any,
  handleOpacityChange: (layer: Layer, opacity: number) => any
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}

export default function LayerSelector({
  mapLayers,
  handleVisibilityChange,
  handleOpacityChange
}: Props) {
  const classes = useStyles();

  return (
    <div>
      {mapLayers.map(it =>
        <Paper key={it.get('id')} className={classes.container} elevation={2}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={1}>
              <IconButton onClick={() => handleVisibilityChange(it)}>
                {it.getVisible() ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
              </IconButton>
            </Grid>
            <Grid item xs={10}>
              <Typography>{it.get('title')}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Slider
                disabled={!it.getVisible()}
                min={min}
                max={max}
                step={1}
                value={Math.round(it.getOpacity() * 100)}
                onChange={(_, value) => handleOpacityChange(it, value as number)}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                type="number"
                id="opacity"
                value={Math.round(it.getOpacity() * 100)}
                InputProps={{ inputProps: { min: min, max: max } }}
                onChange={e => handleOpacityChange(it, clamp(parseInt(e.target.value), min, max))}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
    </div>
  )
}