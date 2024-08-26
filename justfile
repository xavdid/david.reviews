# make installed binaries available at the top level

export PATH := "./node_modules/.bin:" + env_var('PATH')

@_default:
    just --list

# run the dev server
@dev:
    astro dev

# general purpose handler for anstro commands
@astro *options="":
    astro {{ options }}

# run syle checks
[no-exit-message]
@lint:
    eslint src
    prettier --check src

# fix issues checks
[no-exit-message]
@lint-fix:
    eslint src --fix
    prettier src --write

# run pre-reqs for building
[no-exit-message]
@typecheck:
    # this only checks .astro files, but not .ts
    astro check
    # so we do this instead
    tsc --noEmit

# do both style and structural checks
[no-exit-message]
@ci: typecheck lint

# tell zapier that a build has completed, skipping the next auto-build
announce_build:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -n "$BUILD_STATUS_UUID" ]; then
        curl "https://store.zapier.com/api/records?secret=$BUILD_STATUS_UUID" -d '{"should_build": false}'
        echo "cleared auto-build"
    else
        echo "skipping build announcement"
    fi

# do a production build
[no-exit-message]
@build: clean typecheck && announce_build
    astro build

# remove the build artifact & data cache
@clean:
    rm -rf dist src/airtable/_cache

@prod-preview: build
    astro preview
