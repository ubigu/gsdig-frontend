# GSDIG frontend

Frontend component of GSDIG. React + Material UI v4 + Typescript + OpenLayers

# Building

Building with webpack

`npm install`
`npm run build`

resulting files will be in `/dist` directory.

or run directly dev mode

`npm run dev`

# Setup

You will need to setup a [Keycloak](https://www.keycloak.org/) instance and modify the configuration in `src/components/keycloak.ts` to match the installation. Environment variables are currently not supported.

You'll also need [gsdig-backend](https://github.com/ubigu/gsdig-backend) running at `/api` path.

Currently the default development setting is to have webpack dev server running at 8081 serving the frontend package as well as proxying `/api` path to the backend running at port 8080. Default setting for both components expect Keycloak to be running 8082 at root path (e.g. no /auth etc.)

Feel free to contact us at Ubigu for further instructions

## About GSDIG

The Geospatial Statistical Data Integration Service, GSDIG, will address frequent needs to integrate and aggregate spatially located unit data from different sources and with statistical background information.

GSDIG is an indexing-based process to integrate statistical data from any domain in areal subdivisions; grids, standard or user modified geographies. It enables reusing location data of/for the original unit record data - usually buildings or cadastral parcels - and geographies from SDI using persistent identifiers (or address matching as extension) which provides an integrated geocoding system and data supply with further aggregation capabilities.

A metadata-driven application for statistical data exploration will pilot the use of additional metadata concerning statistical and spatial data in automating and enhancing the user experience. The eventual goal is to elaborate a multilateral (multisource) geospatial-statistical ecosystem to increase the impact of geospatial and statistical information in decision making.
