import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_OUT = ROOT / 'assets' / 'css' / 'inline-styles.css'

UNWANTED_CLASS_PATTERNS = [
    r'^wp-','^wpb-','^vc_','^x-','^menu-item','^page_item','^page-item-','^widget','^vc_custom_',
    r'^wpb-js-composer','^js-comp-ver-','^theme-','^g5plus-','^arvo-','^woocommerce','^rev_slider',
]

class_re = re.compile(r'class\s*=\s*"([^"]*)"')
style_re = re.compile(r'style\s*=\s*"([^"]*)"')

def is_unwanted(cls):
    for pat in UNWANTED_CLASS_PATTERNS:
        if re.match(pat, cls):
            return True
    return False

def clean_classes(value):
    classes = [c.strip() for c in value.split() if c.strip()]
    kept = [c for c in classes if not is_unwanted(c)]
    return ' '.join(kept)

def ensure_css_link(html, rel_path):
    link_tag = f'<link rel="stylesheet" href="{rel_path}">'
    if link_tag in html:
        return html
    # insert before </head>
    if '</head>' in html:
        return html.replace('</head>', link_tag + '\n</head>')
    # fallback: insert before first <body>
    return html.replace('<body', link_tag + '\n<body', 1)

def process_file(path, style_map, counter):
    text = path.read_text(encoding='utf-8')

    # Clean classes
    def class_sub(m):
        orig = m.group(1)
        new = clean_classes(orig)
        if new:
            return f'class="{new}"'
        else:
            return ''
    text = class_re.sub(class_sub, text)

    # Extract inline styles into classes
    def style_sub(m):
        nonlocal counter
        style_text = m.group(1).strip()
        if not style_text:
            return ''
        if style_text in style_map:
            cls = style_map[style_text]
        else:
            cls = f'inline-style-{counter}'
            style_map[style_text] = cls
            counter += 1
        # attach class attribute: if element already has class attribute nearby, we will append later
        return f' class="{cls}"'

    # Replace style="..." with class attribute (naive but effective)
    text = style_re.sub(style_sub, text)

    # Ensure CSS link to inline-styles exists, compute relative path
    rel = os.path.relpath(CSS_OUT, start=path.parent)
    rel = rel.replace('\\', '/')
    text = ensure_css_link(text, rel)

    path.write_text(text, encoding='utf-8')
    return counter

def main():
    style_map = {}
    counter = 1
    html_files = list(ROOT.rglob('*.html'))
    for f in html_files:
        # skip files under assets or scripts
        if 'assets' in f.parts or 'scripts' in f.parts:
            continue
        counter = process_file(f, style_map, counter)

    # write CSS file
    CSS_OUT.parent.mkdir(parents=True, exist_ok=True)
    with CSS_OUT.open('w', encoding='utf-8') as out:
        out.write('/* Inline styles extracted by clean_html.py */\n')
        for style_text, cls in style_map.items():
            out.write(f'.{cls} {{ {style_text} }}\n')

    print(f'Processed {len(html_files)} HTML files, extracted {len(style_map)} unique inline styles.')

if __name__ == '__main__':
    main()
