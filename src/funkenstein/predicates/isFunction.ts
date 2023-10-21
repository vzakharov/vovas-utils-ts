import _ from "lodash";
import { asTypeguard } from "./common";

export const isFunction = asTypeguard(_.isFunction);