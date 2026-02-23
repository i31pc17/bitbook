#!/usr/bin/env python3
"""멀티 mdBook 빌드 — 각 책을 독립 mdBook으로 빌드하고 랜딩페이지와 합친다."""

import functools
import http.server
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THEME_DIR = ROOT / "theme"
IGNORE_FILES = {"README.md", "SUMMARY.md", "book.toml"}
IGNORE_DIRS = {
    "작성중",
    ".git",
    ".github",
    ".bin",
    "theme",
    "book",
    "scripts",
    "node_modules",
}
OUTPUT_DIR = ROOT / "book"


def extract_number(name: str) -> int:
    m = re.match(r"(\d+)", name)
    return int(m.group(1)) if m else 9999


def encode_path(posix_path: str) -> str:
    return posix_path.replace(" ", "%20")


def get_title(filepath: Path) -> str:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("# "):
                    return line[2:].strip()
                if line.startswith("## "):
                    return line[3:].strip()
    except Exception:
        pass
    return filepath.stem


def discover_chapters(book_dir: Path) -> list[tuple[str, str]]:
    """책 디렉토리에서 챕터 목록을 발견한다. (상대경로, 제목)"""
    chapters = []

    # 하위 디렉토리의 md 파일
    subdirs = sorted(
        [d for d in book_dir.iterdir() if d.is_dir() and d.name not in IGNORE_DIRS],
        key=lambda d: extract_number(d.name),
    )
    for subdir in subdirs:
        md_files = sorted(
            [
                f
                for f in subdir.iterdir()
                if f.suffix == ".md" and f.name not in IGNORE_FILES
            ],
            key=lambda f: extract_number(f.name),
        )
        for md_file in md_files:
            title = get_title(md_file)
            rel = encode_path(md_file.relative_to(book_dir).as_posix())
            chapters.append((rel, title))

    # 루트 레벨 md 파일
    md_files = sorted(
        [
            f
            for f in book_dir.iterdir()
            if f.suffix == ".md" and f.name not in IGNORE_FILES
        ],
        key=lambda f: extract_number(f.name),
    )
    for md_file in md_files:
        title = get_title(md_file)
        rel = encode_path(md_file.relative_to(book_dir).as_posix())
        chapters.append((rel, title))

    return chapters


def generate_book_toml(book_dir: Path, title: str, slug: str) -> Path:
    """각 책 폴더에 book.toml을 생성한다."""
    theme_rel = "../theme"
    toml_content = f"""[book]
title = "{title}"
authors = []
language = "ko"
src = "."

[build]
build-dir = "book"
create-missing = false

[output.html]
theme = "{theme_rel}"
additional-css = ["{theme_rel}/catppuccin.css"]
additional-js = ["{theme_rel}/fzf.umd.js", "{theme_rel}/elasticlunr.js", "{theme_rel}/search-override.js"]
default-theme = "latte"
preferred-dark-theme = "mocha"
site-url = "/bitbook/{slug}/"
git-repository-url = "https://github.com/i31pc17/bitbook"
"""
    toml_path = book_dir / "book.toml"
    with open(toml_path, "w", encoding="utf-8") as f:
        f.write(toml_content)
    return toml_path


def generate_summary(book_dir: Path, title: str) -> Path:
    """각 책 폴더에 SUMMARY.md를 생성한다."""
    lines = [f"# {title}\n\n"]

    readme = book_dir / "README.md"
    if readme.exists():
        lines.append("- [소개](README.md)\n")

    chapters = discover_chapters(book_dir)
    for path, ch_title in chapters:
        lines.append(f"- [{ch_title}]({path})\n")

    summary_path = book_dir / "SUMMARY.md"
    with open(summary_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

    return summary_path


def make_slug(path: str) -> str:
    """폴더명을 URL-safe slug로 변환."""
    return path.replace(" ", "-")


LANDING_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{site_title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Noto Sans KR', sans-serif; background: #eff1f5; color: #4c4f69; min-height: 100vh; display: flex; flex-direction: column; }}
        header {{ text-align: center; padding: 4rem 1rem 2rem; }}
        header h1 {{ font-size: 2.4rem; font-weight: 700; color: #4c4f69; letter-spacing: -0.02em; }}
        header p {{ margin-top: 0.5rem; font-size: 1.05rem; color: #6c6f85; }}
        .grid {{ max-width: 960px; margin: 0 auto; padding: 1rem 1.5rem 3rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }}
        .card {{ background: #e6e9ef; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 0.75rem; transition: box-shadow 0.2s, transform 0.2s; }}
        .card:hover {{ box-shadow: 0 4px 20px rgba(114, 135, 253, 0.25); transform: translateY(-2px); }}
        .tag {{ display: inline-block; font-size: 0.75rem; font-weight: 500; padding: 0.2rem 0.6rem; border-radius: 999px; background: #dce0e8; color: #6c6f85; width: fit-content; }}
        .card h2 {{ font-size: 1.15rem; font-weight: 700; color: #4c4f69; line-height: 1.4; }}
        .meta {{ font-size: 0.85rem; color: #8c8fa1; }}
        footer {{ text-align: center; padding: 2rem 1rem; margin-top: auto; font-size: 0.8rem; color: #9ca0b0; }}
    </style>
</head>
<body>
    <header>
        <h1>{site_title}</h1>
        <p>{site_description}</p>
    </header>
    <div class="grid">{cards}</div>
    <footer>Powered by mdBook</footer>
</body>
</html>"""

CARD_TEMPLATE = """
        <a class="card" href="./{slug}/">
            <span class="tag">{tag}</span>
            <h2>{title}</h2>
            <span class="meta">{chapters}장</span>
        </a>"""


def generate_landing(config: dict, books_meta: list[dict]) -> str:
    cards = ""
    for meta in books_meta:
        cards += CARD_TEMPLATE.format(**meta)
    return LANDING_TEMPLATE.format(
        site_title=config.get("title", "BitBook"),
        site_description=config.get("description", ""),
        cards=cards,
    )


def build_book(book_dir: Path, slug: str) -> bool:
    """mdbook build를 실행하고 결과를 OUTPUT_DIR/{slug}/ 로 복사."""
    print(f"  Building: {book_dir.name}...")
    result = subprocess.run(
        ["mdbook", "build"],
        cwd=str(book_dir),
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if result.returncode != 0:
        print(f"  [FAIL] {book_dir.name}")
        print(result.stderr)
        return False

    # book/ -> OUTPUT_DIR/{slug}/
    src = book_dir / "book"
    dst = OUTPUT_DIR / slug
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)

    # 로컬 빌드 결과물 정리
    shutil.rmtree(src)

    print(f"  [OK] {book_dir.name} -> book/{slug}/")
    return True


def cleanup_generated(book_dir: Path):
    """빌드 후 생성한 book.toml, SUMMARY.md, theme/ 정리."""
    for f in ["book.toml", "SUMMARY.md"]:
        p = book_dir / f
        if p.exists():
            p.unlink()
    # mdbook이 additional-css/js 처리 시 소스 폴더에 theme/ 을 생성하므로 정리
    theme_in_book = book_dir / "theme"
    if theme_in_book.exists() and theme_in_book.is_dir():
        shutil.rmtree(theme_in_book)


def serve_book(watch: bool = False, port: int = 3000):
    """book/ 디렉토리를 로컬 HTTP 서버로 제공한다."""
    handler = functools.partial(
        http.server.SimpleHTTPRequestHandler, directory=str(OUTPUT_DIR)
    )
    server = http.server.HTTPServer(("localhost", port), handler)

    print(f"\n📖 Serving at http://localhost:{port}")
    print(f"   Landing:  http://localhost:{port}/")
    print("   Press Ctrl+C to stop\n")

    if watch:
        watcher = threading.Thread(target=_watch_and_rebuild, daemon=True)
        watcher.start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        server.server_close()


def _get_md_mtimes() -> dict[str, float]:
    """모든 책 폴더의 .md 파일 수정시간을 수집."""
    mtimes: dict[str, float] = {}
    config_path = ROOT / "_config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)
    for book_cfg in config["books"]:
        book_dir = ROOT / book_cfg["path"]
        if not book_dir.exists():
            continue
        for md in book_dir.rglob("*.md"):
            mtimes[str(md)] = md.stat().st_mtime
    return mtimes


def _watch_and_rebuild():
    """파일 변경을 감지하고 변경된 책만 리빌드."""
    print("  👀 Watching for changes...")
    prev = _get_md_mtimes()

    while True:
        time.sleep(2)
        curr = _get_md_mtimes()
        if curr != prev:
            # 변경된 파일이 속한 책 찾기
            changed_files = {p for p in curr if curr.get(p) != prev.get(p)} | (
                set(curr) - set(prev)
            )

            config_path = ROOT / "_config.json"
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)

            rebuilt = set()
            for book_cfg in config["books"]:
                book_path = book_cfg["path"]
                book_dir = ROOT / book_path
                book_prefix = str(book_dir)
                for cf in changed_files:
                    if cf.startswith(book_prefix) and book_path not in rebuilt:
                        title = book_cfg.get("title", book_path)
                        slug = make_slug(book_path)
                        print(f"\n  🔄 Change detected in {book_path}, rebuilding...")
                        generate_book_toml(book_dir, title, slug)
                        generate_summary(book_dir, title)
                        ok = build_book(book_dir, slug)
                        cleanup_generated(book_dir)
                        if ok:
                            rebuilt.add(book_path)

            if rebuilt:
                # 랜딩페이지도 재생성
                books_meta = []
                for book_cfg in config["books"]:
                    bp = book_cfg["path"]
                    bd = ROOT / bp
                    if not bd.exists():
                        continue
                    chapters = discover_chapters(bd)
                    books_meta.append(
                        {
                            "title": book_cfg.get("title", bp),
                            "slug": make_slug(bp),
                            "chapters": len(chapters),
                            "path": bp,
                            "tag": book_cfg.get("tag", ""),
                        }
                    )
                html = generate_landing(config, books_meta)
                with open(OUTPUT_DIR / "index.html", "w", encoding="utf-8") as f:
                    f.write(html)
                print(f"  ✅ Rebuilt {len(rebuilt)} book(s)")

            prev = curr


def main():
    config_path = ROOT / "_config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    if OUTPUT_DIR.exists():
        for item in OUTPUT_DIR.iterdir():
            if item.name == ".git":
                continue
            if item.is_dir():
                shutil.rmtree(item)
            else:
                item.unlink()
    else:
        OUTPUT_DIR.mkdir()

    build_mode = "--build" in sys.argv or "--serve" in sys.argv or "--watch" in sys.argv
    serve_mode = "--serve" in sys.argv or "--watch" in sys.argv
    watch_mode = "--watch" in sys.argv
    books_meta = []

    for book_cfg in config["books"]:
        book_path = book_cfg["path"]
        book_dir = ROOT / book_path
        if not book_dir.exists():
            print(f"  [SKIP] {book_path} - not found")
            continue

        title = book_cfg.get("title", book_path)
        slug = make_slug(book_path)
        chapters = discover_chapters(book_dir)

        books_meta.append(
            {
                "title": title,
                "slug": slug,
                "chapters": len(chapters),
                "path": book_path,
                "tag": book_cfg.get("tag", ""),
            }
        )

        # 1) book.toml + SUMMARY.md 생성
        generate_book_toml(book_dir, title, slug)
        generate_summary(book_dir, title)
        print(f"  [GEN] {title} - {len(chapters)} chapters")

        if build_mode:
            # 2) mdbook build
            ok = build_book(book_dir, slug)
            # 3) 생성한 설정파일 정리
            cleanup_generated(book_dir)
            if not ok:
                sys.exit(1)

    if build_mode:
        # 랜딩페이지 자동 생성
        html = generate_landing(config, books_meta)
        with open(OUTPUT_DIR / "index.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("  [OK] Landing page generated")


        # additional-css/js가 ../theme/ 경로를 참조하므로 output 루트에 theme/ 복사
        shared_theme = OUTPUT_DIR / "theme"
        if shared_theme.exists():
            shutil.rmtree(shared_theme)
        shutil.copytree(THEME_DIR, shared_theme)
        print("  [OK] Shared theme copied to book/theme/")

        # .nojekyll
        (OUTPUT_DIR / ".nojekyll").touch()

        print(f"\nBuild complete: {len(books_meta)} books -> book/")

        if serve_mode:
            serve_book(watch=watch_mode)
    else:
        print(f"\nGenerated configs for {len(books_meta)} books")
        print("Run with --build to build all books")
        print("Run with --serve to build and preview locally")
        print("Run with --watch to build, serve, and auto-rebuild on changes")


if __name__ == "__main__":
    main()
