export function makeShadow(color: string, strength = 1) {
  return {
    shadowColor: color,
    shadowOpacity: 0.2 * strength,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: Math.round(12 * strength),
  };
}
