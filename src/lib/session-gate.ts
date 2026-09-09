let allowed = false;

export function isAppAllowed(): boolean {
  return allowed;
}

export function allowApp(): void {
  allowed = true;
}

export function denyApp(): void {
  allowed = false;
}
