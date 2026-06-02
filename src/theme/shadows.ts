export function makeShadow(color: string, strength = 1) {
  return {
    shadowColor: color,
    shadowOpacity: 0.26 * strength,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
    elevation: Math.round(16 * strength),
  };
}
