export interface PackageJson {
  name: string;
  version: string;
  description: string;
  type?: 'module' | 'commonjs';
  exports?: string | Record<string, unknown>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: {
    node?: string;
    npm?: string;
    [key: string]: Undefinable<string>;
  };
  repository?: {
    type: string;
    url: string;
  };
  author?: string;
  license?: string;
  keywords?: string[];
  [key: string]: unknown;
}
