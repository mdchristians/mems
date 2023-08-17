import NodeGeocoder from "node-geocoder";
import { ENV } from "./env";

// @ts-ignore
export const geocoder = NodeGeocoder(ENV.GEO_OPTIONS);
