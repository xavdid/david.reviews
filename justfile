# set quiet # not supported on the version of just that's apparently running in the build image

# make installed binaries available at the top level
export PATH := "./node_modules/.bin:" + env_var('PATH')

_default:
    just --list --unsorted

# run the dev server
dev:
    astro dev

# general purpose handler for anstro commands
[no-exit-message]
astro *args="":
    astro {{ args }}

# run syle checks
[no-exit-message]
lint:
    eslint src
    prettier --check src

# fix issues checks
[no-exit-message]
lint-fix:
    eslint src --fix
    prettier src --write

# run pre-reqs for building
[no-exit-message]
typecheck:
    # this only checks .astro files, but not .ts
    astro check
    # so we do this instead
    tsc --noEmit

# do both style and structural checks
ci: typecheck lint

build_status_uuid := env("BUILD_STATUS_UUID", "")
# tell zapier that a build has completed, skipping the next auto-build
clear_build:
    #!/usr/bin/env bash
    set -euo pipefail

    if [ -n "{{ build_status_uuid }}" ]; then
        # be quiet in the logs
        curl -sS -o /dev/null "https://store.zapier.com/api/records?secret={{ build_status_uuid }}" -d '{"should_build": false}'
        echo "cleared auto-build"
    else
        echo "skipping build announcement"
    fi

# do a production build
[no-exit-message]
build: clean typecheck && clear_build
    just --version
    astro build

# remove the build artifact & data cache
clean:
    rm -rf dist src/airtable/_cache

prod-preview: build
    astro preview

# generate a new blank article for slug
article slug:
    mkdir "src/content/articles/{{ slug }}"
    cp misc/article-template.mdx "src/content/articles/{{ slug }}/index.mdx"
