# Hosting the JobStack API

The frontend is on Netlify (`https://jobsstack.netlify.app`). Netlify only serves static files, so the FastAPI backend needs a Python host. These steps use **Render** (free plan); Railway or Fly work the same way with the same two commands.

The database is a SQLite file that is **rebuilt during the build** from `data/transformed/jobs_final.json` (it is not committed). If the build fails, the deploy fails and the broken API never goes live.

## 1. Commands and settings

| Setting | Value |
|---|---|
| Build command | `pip install -r deploy/requirements-deploy.txt && python deploy/build_database.py` |
| Start command | `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT` |
| Health check path | `/health` |
| Env `CORS_ORIGINS` | `https://jobsstack.netlify.app` (exact origin: https, no trailing slash, comma-separate more) |
| Env `PYTHON_VERSION` | `3.12.8` (any 3.11+ works) |

`deploy/requirements-deploy.txt` is a lean list (pandas, pydantic, fastapi, uvicorn). The longer command `pip install -r requirements.txt -r backend/requirements.txt` also works, but it installs Jupyter, matplotlib and scipy, which only slows the build.

## 2. Deploy on Render (about 5 minutes)

1. Push this branch / merge the PR into `main`.
2. render.com > **New +** > **Blueprint** > select the GitHub repo. Render reads `render.yaml` and fills in the table above. (Manual way: New + > Web Service > the repo, then type the settings in by hand.)
3. Wait for the build log to end with `OK: database ready at ...` and `Your service is live`.
4. Copy the service URL, for example `https://jobstack-api.onrender.com`.

## 3. Check that it works

Open these in a browser (replace the host):

| URL | Expect |
|---|---|
| `/health` | `{"status":"ok"}` |
| `/docs` | Swagger page listing jobs, locations, skills, analytics |
| `/analytics/summary` | `total_postings` 300 (current dataset) |
| `/skills` | 20 skills, Communication first |
| `/skills/Python` | rank, co-occurring skills, top cities |

## 4. Connect the frontend

1. Netlify > Site settings > Environment variables: add `VITE_API_URL` = the Render URL (no trailing slash), then redeploy.
2. In the frontend code call `fetch(`${import.meta.env.VITE_API_URL}/skills`)` etc. **Note:** at the moment the frontend still builds its numbers from the seeded data in `jobstackData.js` and makes no API calls, so the site will not change until these fetch calls are added.
3. The browser console shows a CORS error if `CORS_ORIGINS` does not exactly match the site origin. Fix the env var and redeploy.

### Endpoint map (what replaces what in `jobstackData.js`)

| Frontend data | Endpoint |
|---|---|
| `BASE_DATA.jobs / companies / skills` | `GET /analytics/summary` |
| `BASE_DATA.skillsTop` | `GET /analytics/top-skills?limit=10` |
| `BASE_DATA.locations` | `GET /locations` |
| `BASE_DATA.companyTop` | `GET /analytics/top-companies` |
| `BASE_DATA.types` | `GET /analytics/by-employment-type` |
| `getSkillsSummary()` | `GET /skills` (`name`, `n_postings`, `pct_of_postings`, `category`) |
| `getSkillPairs()` | `GET /skills/pairs?exclude_soft=true&min_count=4` |
| `getCooccurrenceMatrix()` | `GET /skills/cooccurrence?skills=Python&skills=SQL` |
| `getSkillDeepDive(name)` | `GET /skills/{name}` (`rank`, `co_occurring`, `top_cities`, `top_roles`) |
| Job explorer list / detail | `GET /jobs`, `GET /jobs/{id}`, `GET /jobs/filters` |

Field names are snake_case (`n_postings`, `pct_of_jobs`) while the frontend uses camelCase (`count`, `pctOfJobs`), so map them when you read the response.

**Not available from the real data** (the frontend's seeded data invents these): average salary per skill (only 3 postings have any salary text and none has a number), weekly posting trend, seniority "levels", and the fake company names. The real database has 20 skills (the seeded one shows 36) and 259 companies, so numbers on the site will change once it uses the API.

## 5. Things to know

- **Free plan sleeps** after about 15 minutes without traffic. The first request after that takes 30-60 seconds; the next ones are fast.
- **Disk is not permanent** on free hosts, which is why the database is rebuilt at build time rather than uploaded.
- The API is read-only (GET only) and opens the database in read-only mode.

## 6. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Build fails at `build_database.py` | Read the log line starting `BUILD FAILED` or `[FAIL]`; the data file or a check is wrong |
| `/skills` returns 503 "Database not found" | The build did not create `data/jobstack_final.db`; check the build log, or set `JOBSTACK_DB` to the file path |
| Browser says CORS error | `CORS_ORIGINS` differs from the site origin (typo, `http` vs `https`, trailing slash) |
| 404 on every URL | Start command is wrong; it must be `backend.app.main:app` |
| Works locally, not on the host | Check `PYTHON_VERSION` and that the start command uses `$PORT` |

Run locally: `pip install -r deploy/requirements-deploy.txt && python deploy/build_database.py && uvicorn backend.app.main:app --reload`, then open http://127.0.0.1:8000/docs.
