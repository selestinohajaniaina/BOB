import { canReplaceContext, MAX_CONTEXT_FILE_SIZE, readContextFile, validateContextFile } from './context-file.util';

describe('context file utilities', () => {
  it('accepts arbitrary .md and .txt file names', () => {
    expect(validateContextFile(new File(['markdown'], 'cahier-des-charges.md'))).toBeNull();
    expect(validateContextFile(new File(['texte'], 'mon_projet.txt'))).toBeNull();
    expect(validateContextFile(new File(['agents'], 'AGENTS.md'))).toBeNull();
  });
  it('refuses unsupported extensions', () => {
    expect(validateContextFile(new File(['pdf'], 'projet.pdf'))).toContain('.md ou .txt');
    expect(validateContextFile(new File(['docx'], 'projet.docx'))).toContain('.md ou .txt');
  });
  it('refuses oversized files', () => {
    const file = new File([new Uint8Array(MAX_CONTEXT_FILE_SIZE + 1)], 'large.txt');
    expect(validateContextFile(file)).toContain('512 Kio');
  });
  it('returns the exact editable content', async () => {
    const content = '# Projet\n\n- Une fonctionnalité\n';
    await expectAsync(readContextFile(new File([content], 'README.md'))).toBeResolvedTo(content);
  });
  it('refuses an empty file', async () => {
    await expectAsync(readContextFile(new File(['  \n'], 'empty.txt'))).toBeRejectedWithError('Le fichier sélectionné est vide.');
  });
  it('keeps the current context when replacement is cancelled', () => {
    expect(canReplaceContext('Contexte existant', () => false)).toBeFalse();
  });
  it('allows a confirmed replacement and does not prompt for an empty context', () => {
    expect(canReplaceContext('Contexte existant', () => true)).toBeTrue();
    const ask = jasmine.createSpy('ask');
    expect(canReplaceContext('   ', ask)).toBeTrue();
    expect(ask).not.toHaveBeenCalled();
  });
});
