# make installed binaries available at the top level
export PATH := "./node_modules/.bin:" + env_var('PATH')

@_default:
	just --list

# run the dev server
@dev:
	astro dev

# general purpose handler for anstro commands
@astro *options="":
	astro {{options}}

# run syle checks
[no-exit-message]
@lint:
	eslint src
	prettier --check src

# run pre-reqs for building
[no-exit-message]
@validate:
	astro check

# do both style and structural checks
[no-exit-message]
@ci: validate lint

# do a production build
[no-exit-message]
@build: clean validate
	astro build

# remove the build artifact & data cache
@clean:
	rm -rf dist src/airtable/_cache
