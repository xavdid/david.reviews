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
@validate:
	astro check
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
