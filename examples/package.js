'use strict';

const mo = require('..').default;

mo.fetchPackage('core', 'caffeinelabs/motoko-core/main/src')
    .then(async ({ files, ...meta }) => {
        console.log('Metadata:', meta);
        console.log('Files:', Object.keys(files))
    });
