#!/usr/bin/env python3
"""Builds the site's HTML pages from src/.

Each page in src/pages/ starts with a few settings lines:
    <!-- title: Page title -->
    <!-- description: One-line description for search and sharing -->
    <!-- nav: about -->          (which menu item to highlight; optional)
    <!-- body: home -->          (extra class on <body>; optional)
The shared head, header and footer live in src/partials/.
Run from the repository root:  python3 tools/build.py
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
VERSION = "40"

def part(name):
    return (SRC / "partials" / name).read_text()

def build_page(path):
    text = path.read_text()
    meta = dict(re.findall(r"<!--\s*(\w+):\s*(.*?)\s*-->", text.split("\n\n", 1)[0]))
    body = re.sub(r"\A(?:\s*<!--.*?-->\s*\n)+", "", text, flags=re.S)
    header = part("header.html")
    nav = meta.get("nav")
    if nav:
        header = header.replace(f'data-nav="{nav}"', f'data-nav="{nav}" aria-current="page"')
    html = part("head.html") + header + body + part("footer.html")
    html = (html.replace("{{title}}", meta.get("title", "AccessAble"))
                .replace("{{description}}", meta.get("description", ""))
                .replace("{{bodyclass}}", meta.get("body", ""))
                .replace("{{version}}", VERSION))
    if path.name == "404.html":  # shown at any broken URL, so links must resolve from the site root
        html = html.replace("<head>\n", '<head>\n<base href="https://accessableco.com/">\n', 1)
    (ROOT / path.name).write_text(html)
    return path.name

if __name__ == "__main__":
    built = [build_page(p) for p in sorted((SRC / "pages").glob("*.html"))]
    print("built:", ", ".join(built))
