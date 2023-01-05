import * as path from 'path';
import hcl2json from '@cdktf/hcl2json';
import { execSync } from 'child_process';
import type { Transformer } from '@jest/transform';
import { schema } from './helper/schema';

function createTransformer(): Transformer {
  return {
    getCacheKey(data, filePath, options) {
      return `${data}${filePath}${options}`;
    },

    process(sourceText, sourcePath, options) {
      const parserPath = path.join(__dirname, 'helper', 'parse-hcl.js');
      const raw = execSync(`node ${parserPath} ${sourcePath}`, { encoding: 'utf8' });
      const parsed = schema.parse(JSON.parse(raw));
      return {
        code: `module.exports = ${JSON.stringify(parsed)};`,
      };
    },

    processAsync(sourceText, sourcePath, options) {
      return hcl2json.parse(path.basename(sourcePath), sourceText).then((parsed) => {
        return {
          code: `module.exports = ${JSON.stringify(parsed)};`,
        };
      });
    },
  }
}

export = { createTransformer };
