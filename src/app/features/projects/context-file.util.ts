export const MAX_CONTEXT_FILE_SIZE = 512 * 1024;
export const REPLACE_CONTEXT_MESSAGE = 'Le contexte actuel sera remplacé par le contenu du fichier. Voulez-vous continuer ?';

export function validateContextFile(file: File): string | null {
  if (!/\.(md|txt)$/i.test(file.name)) return 'Format non supporté. Sélectionnez un fichier .md ou .txt.';
  if (file.size > MAX_CONTEXT_FILE_SIZE) return 'Le fichier est trop volumineux. La taille maximale est de 512 Kio.';
  return null;
}

export async function readContextFile(file: File): Promise<string> {
  const content = await file.text();
  if (!content.trim()) throw new Error('Le fichier sélectionné est vide.');
  return content;
}

export function canReplaceContext(currentContext: string, ask: (message: string) => boolean = confirm): boolean {
  return !currentContext.trim() || ask(REPLACE_CONTEXT_MESSAGE);
}
