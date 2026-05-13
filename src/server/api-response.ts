/**
 * App Router API route yardımcıları (sunucu).
 */
import { NextResponse } from 'next/server';

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export function jsonOk<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}
