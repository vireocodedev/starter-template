export type AuthoritativeItemVersion = { id: string; version: number };

export type OfflineItemCommand = {
  body: unknown;
  commandId: string;
  createdAt: number;
  headers: Record<string, string>;
  method: string;
  url: string;
};

export type RebasedOfflineItemCommands = {
  commands: OfflineItemCommand[];
  deletedItemIds: string[];
};

type ItemRevision = { exists: boolean; version: number };

export function offlineItemIdFor(command: Pick<OfflineItemCommand, "body" | "url">): string {
  const urlId = command.url.match(/\/api\/items\/([^/]+)$/u)?.[1];
  const bodyId = isObject(command.body) && typeof command.body.id === "string" ? command.body.id : undefined;
  const itemId = urlId ?? bodyId;
  if (!itemId) throw new Error("Cannot rebase an offline Item command without an Item ID.");
  return itemId;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function itemBody(command: OfflineItemCommand, itemId: string, version: number): Record<string, unknown> {
  if (!isObject(command.body))
    throw new Error(`Cannot rebase Item command ${command.commandId} with a non-object body.`);
  return { ...command.body, id: itemId, version };
}

/**
 * Replays local intent against one authoritative snapshot. Commands receive fresh
 * IDs and unique monotonic timestamps while preserving their capture order.
 */
export function rebaseOfflineItemCommands(
  commands: readonly OfflineItemCommand[],
  authoritativeItems: readonly AuthoritativeItemVersion[],
  newCommandId: () => string = () => crypto.randomUUID(),
): RebasedOfflineItemCommands {
  const revisions = new Map<string, ItemRevision>(
    authoritativeItems.map(item => [item.id, { exists: true, version: item.version }]),
  );
  const rebased: OfflineItemCommand[] = [];
  const deletedItemIds: string[] = [];

  const orderedCommands = [...commands].sort(
    (left, right) => left.createdAt - right.createdAt || left.commandId.localeCompare(right.commandId),
  );
  const firstCreatedAt = orderedCommands[0]?.createdAt ?? 0;

  for (const [commandIndex, command] of orderedCommands.entries()) {
    const itemId = offlineItemIdFor(command);
    const revision = revisions.get(itemId) ?? { exists: false, version: 0 };
    let method: string;
    let url: string;
    let body: unknown;

    switch (command.method) {
      case "POST":
        if (revision.exists) {
          method = "PUT";
          url = `/api/items/${itemId}`;
          body = itemBody(command, itemId, revision.version);
          revision.version += 1;
        } else {
          method = "POST";
          url = "/api/items";
          body = itemBody(command, itemId, 0);
          revision.exists = true;
          revision.version = 0;
        }
        break;
      case "PUT":
        if (revision.exists) {
          method = "PUT";
          url = `/api/items/${itemId}`;
          body = itemBody(command, itemId, revision.version);
          revision.version += 1;
        } else {
          method = "POST";
          url = "/api/items";
          body = itemBody(command, itemId, 0);
          revision.exists = true;
          revision.version = 0;
        }
        break;
      case "DELETE":
        if (!revision.exists) {
          deletedItemIds.push(itemId);
          continue;
        }
        method = "DELETE";
        url = `/api/items/${itemId}`;
        body = { version: revision.version };
        revision.exists = false;
        revision.version = 0;
        break;
      default:
        throw new Error(`Cannot rebase unsupported offline Item method ${command.method}.`);
    }

    revisions.set(itemId, revision);
    rebased.push({
      ...command,
      body,
      commandId: newCommandId(),
      createdAt: firstCreatedAt + commandIndex,
      method,
      url,
    });
  }

  return { commands: rebased, deletedItemIds: [...new Set(deletedItemIds)] };
}
