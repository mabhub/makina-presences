#!/bin/sh
":" //# comment; export NVM_DIR="$HOME/.nvm"
":" //# comment; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
":" //# comment; exec /usr/bin/env node --max-http-header-size 15000 "$0" "$@"

require('dotenv').config({ path: '.env.local' });
const { handler: update } = require('../functions/update');

update();
