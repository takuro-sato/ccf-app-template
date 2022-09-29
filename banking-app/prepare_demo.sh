#!/bin/bash

# Hack to use default resolve.js
# It should be improved after '--no-default-constitution' is added to sandbox.sh.
# Or change constitution by editiong cchost_config*.json.
# TODO: write the hack

# Run sandbox. Consider 3 members as 3 banks.
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0
