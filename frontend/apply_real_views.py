"""Wire real_data.js + real_views.js into the dashboard. Run in the frontend folder: python apply_real_views.py"""
import pathlib

NEW = """          {currentView === 'employment' && window.EmploymentView && <window.EmploymentView />}
          {currentView === 'quality' && window.QualityView && <window.QualityView />}
          {currentView === 'about' && window.AboutView && <window.AboutView />}
"""
TAGS = '<script src="real_data.js"></script>\n<script src="real_views.js"></script>\n'
for name in ["index.html", "standalone_react.html"]:
    p = pathlib.Path(name)
    if not p.exists():
        continue
    s = p.read_text(encoding="utf-8")
    if "real_views.js" in s:
        print(name, "already patched")
        continue
    a, tag = s.find("{currentView === 'employment'"), s.find('<script type="text/babel">')
    b = s.find("</section>", a)
    if min(a, b, tag) < 0:
        print(name, "NOT patched: pattern not found")
        continue
    p.with_suffix(p.suffix + ".bak").write_text(s, encoding="utf-8")
    ls, lb = s.rfind("\n", 0, a) + 1, s.rfind("\n", 0, b) + 1
    s = s[:ls] + NEW + s[lb:]
    s = s.replace('<script type="text/babel">', TAGS + '<script type="text/babel">', 1)
    p.write_text(s, encoding="utf-8")
    print(name, "patched")
