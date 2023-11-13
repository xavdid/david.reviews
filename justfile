# make installed binaries available at the top level
export PATH := "./node_modules/.bin:" + env_var('PATH')

@_default:
	just --list

@dev:
	astro dev

# general purpose handler for anstro commands
@astro *options="":
	astro {{options}}

# to any checks to ensure the site is ready to go
[no-exit-message]
@validate: clean
	astro check
# tsc --noEmit
# broken until ~ prettier 3.1 is out
# https://github.com/prettier/prettier/issues/15079
# prettier --check .

# don't need to test, since the only test so far is for an unused function
# just test
# eslint?

# do a production build
[no-exit-message]
@build: validate
	astro build

[no-exit-message]
@test:
  vitest run

@test-watch:
  vitest watch

# remove the build artifact
@clean:
	rm -rf dist

# bust the dev cache
@clear-cache:
	rm -rf src/airtable/_cache
