const LOCK_KEY = Symbol.for('imprints.git-lock.queue');

type LockGlobal = typeof global & { [LOCK_KEY]?: Promise<unknown> };

/**
 * Serializes every git operation this app issues into one FIFO queue, since
 * they all share a single working directory. Keyed on Node's `global` (via
 * an interned `Symbol.for`) rather than a module-level variable, because
 * `next dev` can re-evaluate this module more than once per compilation —
 * a plain module-level variable would silently reset the queue on that
 * re-evaluation.
 */
export function withGitLock<T>(task: () => Promise<T>): Promise<T> {
  const globalWithLock = global as LockGlobal;
  const queue = globalWithLock[LOCK_KEY] ?? Promise.resolve();

  const result = queue.then(task, task);

  globalWithLock[LOCK_KEY] = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}
