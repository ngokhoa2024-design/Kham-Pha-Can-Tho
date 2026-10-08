from pathlib import Path
import re

root = Path('.')
html_files = sorted(root.glob('*.html'))
added_css = []
for path in html_files:
    text = path.read_text(encoding='utf8')
    if 'responsive.css' in text:
        continue
    if '</head>' not in text:
        continue
    new_text = text.replace('</head>', '    <link rel="stylesheet" href="responsive.css">\n</head>', 1)
    if new_text != text:
        path.write_text(new_text, encoding='utf8')
        added_css.append(path.name)

print('ACCESSED', len(html_files), 'HTML files')
print('ADDED responsive.css to', len(added_css), 'files')
for name in added_css:
    print(name)
