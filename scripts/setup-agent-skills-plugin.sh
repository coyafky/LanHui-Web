#!/usr/bin/env bash
#
# setup-agent-skills-plugin.sh — install/update Addy Osmani's agent-skills plugin locally
#
# This clones the plugin into an ignored local directory:
#   .claude/plugins/agent-skills
#
# Start Claude Code with:
#   claude --plugin-dir .claude/plugins/agent-skills

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_ROOT="$REPO_ROOT/.claude/plugins"
PLUGIN_DIR="$PLUGIN_ROOT/agent-skills"
PLUGIN_URL="https://github.com/addyosmani/agent-skills.git"

mkdir -p "$PLUGIN_ROOT"

if [[ -d "$PLUGIN_DIR/.git" ]]; then
  echo "Updating agent-skills plugin..."
  git -C "$PLUGIN_DIR" pull --ff-only
else
  if [[ -e "$PLUGIN_DIR" ]]; then
    echo "Error: $PLUGIN_DIR exists but is not a git repository." >&2
    echo "Move it aside or remove it, then run this script again." >&2
    exit 1
  fi

  echo "Cloning agent-skills plugin..."
  git clone --depth 1 "$PLUGIN_URL" "$PLUGIN_DIR"
fi

cat <<EOF

agent-skills plugin is ready at:
  $PLUGIN_DIR

Start Claude Code with:
  claude --plugin-dir "$PLUGIN_DIR"

From the repo root, this shorter form also works:
  claude --plugin-dir .claude/plugins/agent-skills

EOF
