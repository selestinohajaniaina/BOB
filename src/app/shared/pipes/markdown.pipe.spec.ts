import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownPipe } from './markdown.pipe';

@Component({ standalone: true, imports: [MarkdownPipe], template: '<div class="rendered" [innerHTML]="content | markdown"></div>' })
class MarkdownHostComponent { content = ''; }

describe('MarkdownPipe', () => {
  let fixture: ComponentFixture<MarkdownHostComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MarkdownHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(MarkdownHostComponent);
  });

  it('renders headings, lists, emphasis, code and GFM tables', () => {
    fixture.componentInstance.content = '# Titre\n\n- élément\n\n**gras** et *italique* avec `code`.\n\n| A | B |\n|---|---|\n| 1 | 2 |';
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toBe('Titre');
    expect(element.querySelector('li')?.textContent).toBe('élément');
    expect(element.querySelector('strong')?.textContent).toBe('gras');
    expect(element.querySelector('em')?.textContent).toBe('italique');
    expect(element.querySelector('code')?.textContent).toBe('code');
    expect(element.querySelector('table')).not.toBeNull();
  });

  it('is sanitized by Angular when bound to innerHTML', () => {
    fixture.componentInstance.content = '<script>window.evil = true</script>\n<img src=x onerror="window.evil=true">\n[piège](javascript:alert(1))';
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('script')).toBeNull();
    expect(element.querySelector('img')?.hasAttribute('onerror')).toBeFalse();
    expect(element.querySelector('a')?.getAttribute('href')).not.toBe('javascript:alert(1)');
  });
});
