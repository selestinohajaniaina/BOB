export type DiagramFamily = 'Structurel' | 'Comportemental' | 'Interaction';
export interface DiagramType { id: string; name: string; family: DiagramFamily; description: string; }
export const diagramTypes: DiagramType[] = [
  { id: 'class', name: 'Diagramme de classes', family: 'Structurel', description: 'Décrit les classes, attributs, méthodes et relations statiques du système.' },
  { id: 'object', name: 'Diagramme d’objets', family: 'Structurel', description: 'Montre des instances concrètes et leurs liens à un instant donné.' },
  { id: 'component', name: 'Diagramme de composants', family: 'Structurel', description: 'Présente les composants logiciels, interfaces et dépendances.' },
  { id: 'composite', name: 'Structure composite', family: 'Structurel', description: 'Détaille la structure interne d’un élément et ses collaborations.' },
  { id: 'package', name: 'Diagramme de packages', family: 'Structurel', description: 'Organise les éléments du modèle en groupes et dépendances.' },
  { id: 'deployment', name: 'Diagramme de déploiement', family: 'Structurel', description: 'Représente les nœuds matériels et le déploiement des artefacts.' },
  { id: 'profile', name: 'Diagramme de profils', family: 'Structurel', description: 'Étend UML avec des stéréotypes, contraintes et valeurs étiquetées.' },
  { id: 'use-case', name: 'Diagramme de cas d’utilisation', family: 'Comportemental', description: 'Relie les acteurs aux services attendus du système.' },
  { id: 'activity', name: 'Diagramme d’activités', family: 'Comportemental', description: 'Représente les actions, décisions, parallélismes et flux.' },
  { id: 'state', name: 'Diagramme d’états', family: 'Comportemental', description: 'Décrit les états successifs d’un objet et leurs transitions.' },
  { id: 'sequence', name: 'Diagramme de séquence', family: 'Interaction', description: 'Ordonne dans le temps les messages échangés entre participants.' },
  { id: 'communication', name: 'Diagramme de communication', family: 'Interaction', description: 'Met l’accent sur les liens et messages numérotés entre objets.' },
  { id: 'interaction', name: 'Aperçu des interactions', family: 'Interaction', description: 'Assemble plusieurs interactions dans un flux de contrôle global.' },
  { id: 'timing', name: 'Diagramme de temps', family: 'Interaction', description: 'Visualise les changements d’état selon une échelle temporelle.' }
];
