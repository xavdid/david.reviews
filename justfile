set quiet

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
lint-check:
    eslint src
    prettier --check src

# fix issues checks
[no-exit-message]
lint:
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
zap_url := "https://store.zapier.com/api/records?secret=" + build_status_uuid
# dynamically add a bash check for whether we're running in CI
ci_check := '[[ -n "${CI-""}" ]] && '

# tell zapier that a build has completed, skipping the next auto-build
set-build to="false":
    #!/usr/bin/env bash
    set -euo pipefail

    # - if this recipe is run directly, only verify that the UUID is present
    # - if this is run as a dependency, only fire if we're in CI
    # this means I can cancel the build locally, but full local builds won't

    # always verify the UUID, sometimes check if we're in CI
    if {{ if is_dependency() == "true" { ci_check } else {""} }}[[ -n "{{ build_status_uuid }}" ]]; then
        # be quiet in the logs
        curl -sS -o /dev/null "{{ zap_url }}" -d '{"should_build": {{ to }}}'
        echo "set build to: {{ to }}"
    else
        echo "skipping build status update"
    fi
alias clear-build := set-build

# set auto-build to true
trigger-build:
    # call just directly so that it skips the CI check
    just set-build true

# get the current build status
get-build:
    curl -sS "{{ zap_url }}" | jq

# do a production build
[no-exit-message]
build: clean typecheck && set-build
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
