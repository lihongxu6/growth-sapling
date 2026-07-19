#!/usr/bin/env python3
"""Use Playwright to visually verify H5 alignment changes."""
import pathlib, sys, time
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path("/workspace/growth-sapling")
TMP = ROOT / ".verify"
TMP.mkdir(exist_ok=True)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox']
        )
        ctx = browser.new_context(viewport={'width': 420, 'height': 900})
        page = ctx.new_page()

        page.on('pageerror', lambda err: print(f'[pageerror] {err}', flush=True))
        page.on('console', lambda msg: print(f'[console.{msg.type}] {msg.text}', flush=True) if msg.type in ('error','warning','log') else None)

        def load_and_wait():
            page.goto(f"file://{ROOT}/index.html")
            # Wait for the splash to finish (1.5s animation + margin)
            page.wait_for_timeout(2200)
            # Remove splash so it never covers content
            page.eval_on_selector('#splash', 'el => el.style.display = "none"')

        # 1) Home page default (after splash)
        load_and_wait()
        page.wait_for_selector('.badge-animation', state='hidden', timeout=5000)
        page.screenshot(path=str(TMP / 'home.png'))
        print('[ok] home.png')

        # 1b) Future-date banner via JS injection
        page.evaluate("""
            const d = new Date();
            d.setDate(d.getDate() + 3);
            viewDate = isoOf(d);
            renderHome();
        """)
        page.wait_for_timeout(300)
        page.screenshot(path=str(TMP / 'home_future.png'))
        future_banner = page.text_content('.backfill-banner')
        print(f'[ok] home_future.png; banner: {future_banner!r}')

        # 2) Click 任务 tab (close any overlay first)
        page.evaluate("() => document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('show'))")
        page.click('.tab-item[data-tab="tasks"]')
        page.wait_for_timeout(300)
        page.screenshot(path=str(TMP / 'tasks.png'))
        print('[ok] tasks.png')

        # 3) Click 我的成长 tab, wait for user-card to appear
        page.click('.tab-item[data-tab="stats"]')
        page.wait_for_selector('.user-card', timeout=5000)
        page.wait_for_timeout(300)
        page.screenshot(path=str(TMP / 'stats.png'))
        print('[ok] stats.png')

        # 4) Verify visible text (scoped to active page)
        home_tab = page.text_content('.tab-item[data-tab="home"]')
        task_tab = page.text_content('.tab-item[data-tab="tasks"]')
        stat_tab = page.text_content('.tab-item[data-tab="stats"]')
        stat_header = page.text_content('#pageStats .page-header-title')
        user_name = page.text_content('#pageStats .user-name')
        print(f"TabBar: {home_tab!r} / {task_tab!r} / {stat_tab!r}")
        print(f"user-card name: {user_name!r}")
        print(f"stats page-header: {stat_header!r}")

        # 5) Test nickname edit (mock prompt with JS injection)
        page.evaluate("""
            const orig = window.prompt;
            window.prompt = () => '果果小朋友';
            editNickname();
            window.prompt = orig;
        """)
        page.wait_for_timeout(300)
        new_name = page.text_content('#pageStats .user-name')
        print(f"after edit: {new_name!r}")
        page.screenshot(path=str(TMP / 'stats_nickname.png'))
        print('[ok] stats_nickname.png')

        browser.close()

if __name__ == '__main__':
    run()
