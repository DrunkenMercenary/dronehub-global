// Test-only stub: revalidatePath/Tag are request-scoped no-ops outside Next.
export function revalidatePath(_path?: string) {}
export function revalidateTag(_tag?: string) {}
export function unstable_cache<T>(fn: T): T { return fn }
