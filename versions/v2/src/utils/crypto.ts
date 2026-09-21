function simpleHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part3}${part4}`;
}

export function generateTxHash(seed: string): string {
  const h1 = simpleHash(seed);
  const h2 = simpleHash(`${seed}-nonce-${seed.length}`);
  return `0x${h1}${h2}`;
}

export function generateMerkleRoot(elements: string[]): string {
  if (elements.length === 0) {
    return `sha256:${simpleHash('empty-root').repeat(2)}`;
  }
  let currentLayer = elements.map(el => simpleHash(el));
  while (currentLayer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      // In Merkle tree construction with an odd number of elements, the last leaf is duplicated to form a pair
      const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
      nextLayer.push(simpleHash(`${left}:${right}`));
    }
    currentLayer = nextLayer;
  }
  return `sha256:${currentLayer[0]}${simpleHash(currentLayer[0])}`;
}

export function calculateProgress(current: number, target: number): { percent: number; isComplete: boolean } {
  if (target <= 0) return { percent: 0, isComplete: false };
  const raw = Math.round((current / target) * 100);
  const percent = Math.min(Math.max(raw, 0), 100);
  return {
    percent,
    isComplete: current >= target,
  };
}
