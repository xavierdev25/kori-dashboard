export function getNoteRotationStyle(
  rotation: number,
  disableRotation: boolean,
): string | undefined {
  return disableRotation ? undefined : `rotate(${rotation}deg)`;
}
