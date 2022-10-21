import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, TableFooter, TablePagination, Typography, makeStyles } from '@material-ui/core';
import PropertyWithTitle from '@src/interfaces/PropertyWithTitle';
import ArealDivisionMetadata from '@src/interfaces/ArealDivisionMetadata';
import { useTranslations } from '@src/translation/TranslationContext';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';

interface Props {
  selected?: ArealDivisionMetadata,
  columns: PropertyWithTitle[],
  source: VectorSource,
  selectedFeatures: (string | number)[],
  onSelectFeature: (id: string | number) => void,
  tx: { add: Feature, del: Feature }[][]
  addToTx: (edit: { add: Feature, del: Feature }) => void,
}

const compareByProperty = (property: string, a: Feature, b: Feature): number => {
  const av = a.get(property);
  const bv = b.get(property);
  return +(av > bv) || -(av < bv);
}

const useStyles = makeStyles((theme) => ({
  title: {
    margin: theme.spacing(2),
  },
  tinyCell: {
    padding: theme.spacing(0.5),
    whiteSpace: "nowrap"
  }
}));

export default function FeatureTable({
  selected,
  columns,
  source,
  selectedFeatures,
  onSelectFeature,
  tx,
  addToTx,
}: Props) {
  const classes = useStyles();
  const { tr } = useTranslations();

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [asc, setAsc] = React.useState<boolean>(!columns.length);
  const [orderBy, setOrderBy] = React.useState<string>(columns.length ? 'groupcount' : null);

  const features = source?.getFeatures() ?? [];
  const len = features?.length ?? 0;

  if (!selected) {
    return <Typography className={classes.title}>{tr.FeatureTable.noSelectedArealDivision}</Typography>
  }
  return (
    <>
      <Typography className={classes.title}>{selected.title}</Typography>
      <Table
        size='small'
        stickyHeader
      >
        <TableHead>
          <TableRow>
            {columns.map(c =>
            <TableCell align="right" className={classes.tinyCell} component="th" key={`header-${c.property}`}>
              <TableSortLabel
                active={orderBy === c.property}
                direction={orderBy === c.property ? (asc ? "asc" : "desc") : "asc"}
                onClick={() => {
                  setAsc(orderBy === c.property && asc ? false : true);
                  setOrderBy(c.property);
                }}
              >
                <Typography>{c.title ?? c.property}</Typography>
              </TableSortLabel>
            </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {
          (
            orderBy
              ? features
                .slice()
                .sort(asc
                  ? (a, b) => compareByProperty(orderBy, a, b)
                  : (a, b) => compareByProperty(orderBy, b, a)
                )
              : features
          )
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map(feature => {
            const id = feature.getId();
            return (
            <TableRow
              key={id}
              hover
              onClick={() => onSelectFeature(id)}
              selected={selectedFeatures.includes(id)}
            >
              {columns.map(c => 
              <TableCell className={classes.tinyCell} align="right" key={`data-${id}-${c.property}`}>
                {tx
                ? <input
                    type="text"
                    value={feature.get(c.property) || ''}
                    onChange={e => {
                      const v = e.target.value;
                      const add = feature.clone();
                      add.setId(id);
                      add.set(c.property, v);
                      const del = feature.clone();
                      del.setId(id);
                      addToTx({ add: add, del: del });
                    }}
                  />
                : feature.get(c.property)
                }
              </TableCell>
              )}
            </TableRow>
            );
          }
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className={classes.tinyCell} colSpan={columns.length}>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                component="div"
                count={len}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(+e.target.value);
                  setPage(0);
                }}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  )
}