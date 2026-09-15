import type { ProductImporter } from "../ports";

/** Lets the user (or a future settings screen) add importers for sites beyond the built-in six, without touching this class. */
export class ImporterRegistry {
  private readonly importers: ProductImporter[] = [];

  register(importer: ProductImporter): void {
    this.importers.push(importer);
  }

  findFor(url: string): ProductImporter | null {
    return this.importers.find((importer) => importer.supports(url)) ?? null;
  }

  list(): ProductImporter[] {
    return [...this.importers];
  }
}
