import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const openApiPath = new URL('../../docs/openapi.yaml', import.meta.url);
const openApiDocument = parse(readFileSync(openApiPath, 'utf8'));

export default openApiDocument;
