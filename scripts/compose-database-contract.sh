#!/usr/bin/env bash

# Shell helpers for scripts that must read Compose database settings without
# executing a deployment environment file. Source this file; do not run it.

read_compose_environment_file() {
  local environment_file="$1"
  local line key value line_number=0

  [[ -f "$environment_file" ]] || {
    printf 'Database environment file is missing: %s\n' "$environment_file" >&2
    return 2
  }

  declare -gA VIREO_COMPOSE_ENV=()
  while IFS= read -r line || [[ -n "$line" ]]; do
    line_number=$((line_number + 1))
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*(#.*)?$ ]] && continue
    if [[ ! "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      printf 'Malformed environment assignment at %s:%s.\n' "$environment_file" "$line_number" >&2
      return 2
    fi
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    if [[ -v "VIREO_COMPOSE_ENV[$key]" ]]; then
      printf 'Duplicate environment key %s in %s.\n' "$key" "$environment_file" >&2
      return 2
    fi
    VIREO_COMPOSE_ENV["$key"]="$value"
  done <"$environment_file"
}

compose_environment_value() {
  local key="$1"
  printf '%s' "${VIREO_COMPOSE_ENV[$key]-}"
}

validate_compose_environment_literal() {
  local key="$1"
  local value="${VIREO_COMPOSE_ENV[$key]-}"

  case "$value" in
    *[[:space:]]*|*\"*|*\'*|*\\*|*\$*|*\#*)
      printf '%s must use an unquoted, uninterpolated literal value.\n' "$key" >&2
      return 2
      ;;
  esac
}

select_compose_database_environment() {
  VIREO_DATABASE_ENV_FILE_RESOLVED=""
  if [[ -n "${VIREO_DATABASE_ENV_FILE:-}" ]]; then
    VIREO_DATABASE_ENV_FILE_RESOLVED="$VIREO_DATABASE_ENV_FILE"
  elif [[ -n "${VIREO_DEMO_ENV_FILE:-}" ]]; then
    VIREO_DATABASE_ENV_FILE_RESOLVED="$VIREO_DEMO_ENV_FILE"
  elif [[ -f .env ]]; then
    VIREO_DATABASE_ENV_FILE_RESOLVED=.env
  fi
  export VIREO_DATABASE_ENV_FILE_RESOLVED
}

resolve_compose_database_contract() {
  select_compose_database_environment

  if [[ -n "$VIREO_DATABASE_ENV_FILE_RESOLVED" ]]; then
    read_compose_environment_file "$VIREO_DATABASE_ENV_FILE_RESOLVED" || return
  else
    declare -gA VIREO_COMPOSE_ENV=()
  fi

  VIREO_DATABASE_NAME="${POSTGRES_DB:-$(compose_environment_value POSTGRES_DB)}"
  VIREO_DATABASE_OWNER_USER="${POSTGRES_OWNER_USER:-$(compose_environment_value POSTGRES_OWNER_USER)}"

  if [[ -n "$VIREO_DATABASE_ENV_FILE_RESOLVED" && ( -z "$VIREO_DATABASE_NAME" || -z "$VIREO_DATABASE_OWNER_USER" ) ]]; then
    printf 'Selected database environment file must define POSTGRES_DB and POSTGRES_OWNER_USER.\n' >&2
    return 2
  fi

  VIREO_DATABASE_NAME="${VIREO_DATABASE_NAME:-starter_template}"
  VIREO_DATABASE_OWNER_USER="${VIREO_DATABASE_OWNER_USER:-starter_template_owner}"

  if [[ ! "$VIREO_DATABASE_NAME" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    printf 'Effective POSTGRES_DB must be a simple PostgreSQL identifier.\n' >&2
    return 2
  fi
  if [[ ! "$VIREO_DATABASE_OWNER_USER" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    printf 'Effective PostgreSQL owner user must be a simple identifier.\n' >&2
    return 2
  fi
}
