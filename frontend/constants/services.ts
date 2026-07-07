import { Ionicons } from '@expo/vector-icons';

export type ServiceCategory = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: [string, string];
  description: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cleaning',
    title: 'Cleaning',
    icon: 'sparkles',
    color: '#26A69A',
    gradient: ['#26A69A', '#00897B'],
    description: 'House & office cleaning',
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: 'water',
    color: '#42A5F5',
    gradient: ['#42A5F5', '#1E88E5'],
    description: 'Pipes, drains & fixtures',
  },
  {
    id: 'electrical',
    title: 'Electrical',
    icon: 'flash',
    color: '#FFA726',
    gradient: ['#FFA726', '#FB8C00'],
    description: 'Wiring, outlets & lights',
  },
  {
    id: 'appliance_repair',
    title: 'Appliances',
    icon: 'snow',
    color: '#7E57C2',
    gradient: ['#7E57C2', '#5E35B1'],
    description: 'AC, washer & repairs',
  },
  {
    id: 'carpentry',
    title: 'Carpentry',
    icon: 'hammer',
    color: '#8D6E63',
    gradient: ['#8D6E63', '#6D4C41'],
    description: 'Furniture & woodwork',
  },
  {
    id: 'painting',
    title: 'Painting',
    icon: 'color-palette',
    color: '#EC407A',
    gradient: ['#EC407A', '#D81B60'],
    description: 'Interior & exterior paint',
  },
  {
    id: 'pest_control',
    title: 'Pest Control',
    icon: 'bug',
    color: '#66BB6A',
    gradient: ['#66BB6A', '#43A047'],
    description: 'Insects & pest treatment',
  },
  {
    id: 'general_handyman',
    title: 'Handyman',
    icon: 'construct',
    color: '#FF7043',
    gradient: ['#FF7043', '#F4511E'],
    description: 'General repairs & tasks',
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  SERVICE_CATEGORIES.map(c => [c.id, c])
);
