#!/usr/bin/env bash

set -euo pipefail

exec 3<>/dev/tcp/127.0.0.1/8080
printf 'GET /actuator/health/readiness HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n' >&3
timeout 3 grep --quiet '"status":"UP"' <&3
