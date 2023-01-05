const fs = require('fs').promises;
const { parse } = require('@cdktf/hcl2json');

// parse first argument as filename
const filePath = process.argv[2];

(async () => {
  const file = await fs.readFile(filePath, 'utf8')
  const json = await parse('maint.tf', file)
  console.log(JSON.stringify(json, null, 2))
})()
