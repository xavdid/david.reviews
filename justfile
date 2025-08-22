set quiet

# make installed binaries available at the top level
export PATH := "./node_modules/.bin:" + env_var('PATH')

_default:
    just --list --unsorted

# run the dev server
[group("development")]
dev:
    astro dev

# general purpose handler for anstro commands
[no-exit-message]
[group("development")]
astro *args="":
    astro {{ args }}

# run syle checks
[no-exit-message]
[group("checks")]
lint-check:
    eslint src
    prettier --check src

# fix issues checks
[no-exit-message]
[group("checks")]
lint:
    eslint src --fix
    prettier src --write

# run pre-reqs for building
[no-exit-message]
[group("checks")]
typecheck:
    # this only checks .astro files, but not .ts
    astro check
    # so we do this instead
    tsc --noEmit

[group("checks")]
test:
    vitest run

# do both style and structural checks
[group("checks")]
ci: test typecheck lint

build_status_uuid := env("BUILD_STATUS_UUID", "")
zap_url := "https://store.zapier.com/api/records?secret=" + build_status_uuid
# dynamically add a bash check for whether we're running in CI
ci_check := '[[ -n "${CI-""}" ]] && '

# set auto-build to true
[group("autobuild")]
trigger-autobuild:
    # call just directly so that it skips the CI check
    just set-autobuild true

# get the current build status
[group("autobuild")]
get-autobuild:
    curl -sS "{{ zap_url }}" | jq

# install deps
[group("development")]
install:
    npm install

# do a production build
[no-exit-message]
[group("development")]
build: clean typecheck test && set-autobuild
    just --version
    astro build

# remove the build artifact & data cache
[group("development")]
clean:
    rm -rf dist src/airtable/_cache

[group("development")]
prod-preview: build
    astro preview

# generate a new blank article for slug
[group("workflow")]
article slug:
    mkdir "src/content/articles/{{ slug }}"
    cp misc/article-template.mdx "src/content/articles/{{ slug }}/index.mdx"

# dumps an svg from the clipboard to the correct folder
[group("workflow")]
svg filename:
    pbpaste > "src/components/icons/svgs/{{ filename }}.svg"

# tell zapier that a build has completed, skipping the next auto-build
[group("autobuild")]
set-autobuild to="false":
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
alias clear-autobuild := set-autobuild
