/**
 * Script to create new vue components and sections.
 * @arg ComponentName - required
 * To create a COMPONENT: npm run new-component ComponentName
 */
 const mkdirp = require('mkdirp');
 const path = require('path');
 const fs = require('fs');
 const maxstache = require('maxstache');
 const chalk = require('chalk');
 const changeCase = require('change-case');
 const argv = require('minimist')(process.argv.slice(2));

 const TYPE = 'component';
 const COMPONENTS_FOLDER = './../src/components/';

 if (!argv._[0]) {
   throw new Error(`Error: Must give a ${TYPE} name to create.`);
 }

 const name = changeCase.pascalCase(argv._[0]);
 const targetFolder = `${name}/`;

 async function write(name, dir) {
   try {
     await mkdirp(dir);

     const templateFileNamePrefix = 'Component';
     const componentFileNamePrefix = name;

     await Promise.all([
       template(
         path.resolve(
           __dirname,
           `templates/${TYPE}/${templateFileNamePrefix}.txt`
         ),
         path.resolve(dir, `${componentFileNamePrefix}.tsx`)
       ),
     ]);
     await Promise.all([
       template(
         path.resolve(
           __dirname,
           `templates/${TYPE}/${templateFileNamePrefix}.styles.txt`
         ),
         path.resolve(dir, `${name}.styles.ts`)
       ),
     ]);
     await Promise.all([
       template(
         path.resolve(
           __dirname,
           `templates/${TYPE}/${templateFileNamePrefix}.stories.txt`
         ),
         path.resolve(dir, `${name}.stories.tsx`)
       ),
     ]);
     console.info(chalk.greenBright(`Created new ${name} ${TYPE} at ${dir}`));
   } catch (error) {
     console.error(chalk.redBright('Write error', error));
   }
 }

 function template(input, output) {
   const data = {
     pascal: changeCase.pascalCase(name),
     param: changeCase.paramCase(name),
     title: changeCase.capitalCase(name),
     depth: targetFolder ? '../' : '',
   };
   return new Promise((resolve, reject) => {
     fs.readFile(input, 'utf8', (err, str) => {
       if (err) {
         return reject(err);
       }
       str = maxstache(str, data);
       fs.writeFile(output, str, writeErr => {
         if (writeErr) {
           return reject(writeErr);
         }
         resolve();
       });
     });
   });
 }

 const cwd = process.cwd();
 const dir = path.resolve(__dirname, [COMPONENTS_FOLDER, targetFolder].join(''));

 fs.stat(dir, async err => {
   if (err) {
     await write(name, dir);
   } else {
     console.info(
       chalk.red(`Path at ${path.relative(cwd, dir)} already exists!`)
     );
   }
 });
