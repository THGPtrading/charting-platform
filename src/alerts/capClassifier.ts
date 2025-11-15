export const classifyCapSize = (price: number): 'Small' | 'Mid' | 'Large' => {
  if (price < 20) return 'Small';
  if (price <= 90) return 'Mid';
  return 'Large';
};