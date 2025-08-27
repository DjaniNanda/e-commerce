import { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'moteur',
    name: 'Moteur',
    subcategories: ['Filtres à air', 'Huiles moteur', 'Bougies', 'Courroies', 'Joints', 'Pistons']
  },
  {
    id: 'freinage',
    name: 'Freinage',
    subcategories: ['Plaquettes de frein', 'Disques de frein', 'Liquide de frein', 'Étriers', 'Flexibles']
  },
  {
    id: 'suspension',
    name: 'Suspension',
    subcategories: ['Amortisseurs', 'Ressorts', 'Silent-blocs', 'Barres stabilisatrices', 'Rotules']
  },
  {
    id: 'transmission',
    name: 'Transmission',
    subcategories: ['Embrayage', 'Boîte de vitesses', 'Cardans', 'Différentiel']
  },
  {
    id: 'electricite',
    name: 'Électricité',
    subcategories: ['Batteries', 'Alternateurs', 'Démarreurs', 'Bougies de préchauffage', 'Fusibles']
  },
  {
    id: 'eclairage',
    name: 'Éclairage',
    subcategories: ['Phares', 'Feux arrière', 'Ampoules', 'Clignotants', 'Feux de brouillard']
  },
  {
    id: 'carrosserie',
    name: 'Carrosserie',
    subcategories: ['Pare-chocs', 'Rétroviseurs', 'Vitres', 'Portières', 'Capots']
  },
  {
    id: 'pneumatiques',
    name: 'Pneumatiques & Jantes',
    subcategories: ['Pneus', 'Jantes', 'Chambres à air', 'Valves']
  }
];