#!/usr/bin/env python3
"""Rebuild the opt-in third-party SVG sprite from pinned local upstream originals.

No network, dependencies, unreviewed SVG tags, external references, or silent
attribute removal. Run with --check in CI to catch drift in the committed sprite.
"""
import argparse
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'registry/third-party-assets.v1.json'
OUTPUT = ROOT / 'assets/third-party/gc-third-party-glyphs.svg'
ELEMENTS = {'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect', 'g'}
ATTRS = {
    'd', 'fill', 'fill-rule', 'clip-rule', 'stroke', 'stroke-width',
    'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
    'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'fill-opacity',
    'stroke-opacity', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1',
    'x2', 'y1', 'y2', 'width', 'height', 'points', 'transform'
}
IGNORED = {'class', 'aria-hidden', 'data-slot', 'focusable'}
PRESENTATION = ATTRS & {'fill', 'fill-rule', 'clip-rule', 'stroke',
    'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
    'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'fill-opacity',
    'stroke-opacity'}
XMLNS = '{http://www.w3.org/2000/svg}'

def local(tag):
    if tag.startswith(XMLNS):
        return tag[len(XMLNS):]
    if '}' in tag or ':' in tag:
        raise ValueError('Unexpected SVG namespace: ' + tag)
    return tag

def copy_safe(node):
    tag = local(node.tag)
    if tag not in ELEMENTS:
        raise ValueError('Unsafe SVG element: ' + tag)
    out = ET.Element(tag)
    for attr, value in node.attrib.items():
        name = local(attr)
        if name in IGNORED:
            continue
        if name not in ATTRS or re.search(r'(?i)url\s*\(|https?:|javascript:|[<>]', value):
            raise ValueError('Unsafe SVG attribute: ' + name)
        out.set(name, value)
    if node.text and node.text.strip():
        raise ValueError('Text is not allowed inside SVG geometry')
    for child in node:
        out.append(copy_safe(child))
    return out

def render():
    entries = json.loads(MANIFEST.read_text(encoding='utf-8'))['icons']
    sprite = ET.Element('svg', xmlns='http://www.w3.org/2000/svg')
    ids = set()
    for entry in entries:
        identifier = entry['id']
        if not re.fullmatch(r'gc-ext-[a-z0-9-]+', identifier) or identifier in ids:
            raise ValueError('Duplicate or invalid sprite ID: ' + identifier)
        ids.add(identifier)
        source = (ROOT / entry['svg']).resolve()
        if not source.is_relative_to((ROOT / 'assets/third-party').resolve()):
            raise ValueError('SVG source escapes asset directory')
        raw = source.read_bytes()
        if len(raw) > 20000 or b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper():
            raise ValueError('Disallowed SVG source: ' + str(source))
        root = ET.fromstring(raw)
        if local(root.tag) != 'svg' or root.attrib.get('viewBox') != entry['viewBox']:
            raise ValueError('Mismatched viewBox: ' + str(source))
        sym = ET.SubElement(sprite, 'symbol', id=identifier, viewBox=entry['viewBox'])
        for attr, val in root.attrib.items():
            name = local(attr)
            if name in PRESENTATION:
                if re.search(r'(?i)url\s*\(|https?:|javascript:|[<>]', val):
                    raise ValueError('Unsafe presentation value: ' + str(source))
                sym.set(name, val)
            elif name not in {'viewBox', 'height', 'width', *IGNORED}:
                raise ValueError('Unexpected SVG root attribute: ' + name)
        for element in root:
            sym.append(copy_safe(element))
    ET.indent(sprite, space='  ')
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<!-- Individually licensed originals: assets/third-party/*/LICENSE -->\n'
            + ET.tostring(sprite, encoding='unicode', short_empty_elements=True) + '\n')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    expected = render()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != expected:
            raise SystemExit('Third-party sprite out of date: run python3 scripts/build-third-party-sprite.py')
        print('Third-party sprite verified from pinned originals.')
    else:
        OUTPUT.write_text(expected, encoding='utf-8')
        print('Wrote sprite:', OUTPUT.relative_to(ROOT))
