#!/bin/bash

npm run build

# Run sandbox. Consider 3 members as 3 banks.
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 2
