import { defineSchema } from "convex/server";
import * as boedorSchema from "./boedor/schema";

export default defineSchema({
  ...boedorSchema.tables,
});
