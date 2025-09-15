# Azure Static Web Apps Workflow Debug Plan

## Current Status
- **Repository**: royal-code-fresh
- **Branch**: main
- **Workflows**: Both CV and Droneshop are configured but need debugging
- **Secrets**: Correctly configured in GitHub

## GitHub Secrets (VERIFIED WORKING)
```
AZURE_STATIC_WEB_APPS_API_TOKEN_CALM_SKY_04833F403 (CV app)
AZURE_STATIC_WEB_APPS_API_TOKEN_LIVELY_TREE_0F45C3F03 (Droneshop app)
```

## Azure Resources
- **CV App**: cv-royvandeweteringnl → https://calm-sky-04833f403.1.azurestaticapps.net
- **Droneshop App**: droneshop-quandarnl → https://lively-tree-0f45c3f03.2.azurestaticapps.net
- **Resource Group**: Royal-Code

## Current Workflow Files
1. `.github/workflows/azure-static-web-apps-cv-royvandeweteringnl.yml`
2. `.github/workflows/azure-static-web-apps-droneshop-quandarnl.yml`

## Debug Steps (Execute in Order)

### Step 1: Check Current Workflow Status
```bash
gh run list --limit 5
gh run view [run-id] --log
```

### Step 2: Verify Repository Structure
```bash
ls -la dist/apps/
# Should show cv/ and droneshop/ directories after build
```

### Step 3: Test Local Build
```bash
pnpm install --no-frozen-lockfile
pnpm exec nx build cv --configuration=production --verbose
pnpm exec nx build droneshop --configuration=production --verbose
```

### Step 4: Verify Build Output Paths
```bash
ls -la dist/apps/cv/browser/
ls -la dist/apps/droneshop/browser/
# These paths MUST exist for deployment to work
```

### Step 5: Check Workflow Configuration Issues

#### Common Problems & Solutions:

**Problem 1: App location not found**
- **Error**: `App Directory Location: 'dist/apps/cv/browser' was not found`
- **Solution**: Update `app_location` in workflow file
- **Fix**: Change to correct path relative to repo root

**Problem 2: Secret token invalid**
- **Error**: `No matching Static Web App was found or the api key was invalid`
- **Solution**: Verify secret names match exactly
- **Check**: `gh secret list` vs workflow file secret names

**Problem 3: Build failures**
- **Error**: Build step fails during `nx build`
- **Solution**: Fix dependency or configuration issues
- **Debug**: Check `pnpm-lock.yaml` and `package.json`

### Step 6: Working Configuration Template

#### CV Workflow (azure-static-web-apps-cv-royvandeweteringnl.yml)
```yaml
name: Azure Static Web Apps CI/CD for CV (cv-royvandeweteringnl)

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Use Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Install pnpm dependencies
        run: |
          echo "Installing dependencies and updating lockfile to handle overrides"
          pnpm install --no-frozen-lockfile
        env:
          CI: true

      - name: Setup esbuild binary manually
        run: |
          echo "Setting up esbuild binary manually to avoid postinstall issues"
          pnpm exec esbuild --version || echo "esbuild setup complete"

      - name: Cache Nx
        uses: actions/cache@v4
        with:
          path: .nx/cache
          key: ${{ runner.os }}-nx-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-nx-

      - name: Build CV App with Nx
        run: pnpm exec nx build cv --configuration=production --verbose

      - name: Deploy to Azure Static Web Apps
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_CALM_SKY_04833F403 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          skip_app_build: true
          app_location: "dist/apps/cv/browser"
          output_location: ""
          api_location: ""
```

#### Droneshop Workflow (azure-static-web-apps-droneshop-quandarnl.yml)
```yaml
# Same structure but with:
# - Build command: pnpm exec nx build droneshop --configuration=production --verbose
# - Secret: AZURE_STATIC_WEB_APPS_API_TOKEN_LIVELY_TREE_0F45C3F03
# - App location: "dist/apps/droneshop/browser"
```

### Step 7: Emergency Fixes

#### If workflows still fail, try these fixes in order:

1. **Fix app_location path**:
```bash
# Check what actually gets built
ls -la dist/apps/cv/
# Update workflow file app_location to match actual path
```

2. **Reset Azure deployment token**:
   - Go to Azure Portal → Static Web App → Configuration → Deployment tokens
   - Reset token
   - Update GitHub secret with new token

3. **Recreate workflow files from scratch**:
   - Delete current workflow files
   - In Azure Portal → Static Web App → Deployment history → "View workflow"
   - Let Azure regenerate the workflow files

### Step 8: Validation Commands

After each fix attempt, run:
```bash
# Check workflow status
gh run list --limit 2

# Check specific run
gh run view [run-id]

# Check logs when available
gh run view --log --job=[job-id]

# Check websites are live
curl -I https://calm-sky-04833f403.1.azurestaticapps.net
curl -I https://lively-tree-0f45c3f03.2.azurestaticapps.net
```

## Success Criteria
- ✅ Both workflows complete successfully
- ✅ Websites are accessible at their Azure URLs
- ✅ No deployment errors in GitHub Actions
- ✅ Build artifacts are correctly uploaded to Azure

## Online Research Schedule
Every 30 minutes, search for:
- "Azure Static Web Apps GitHub Actions deployment issues 2025"
- "Azure Static Web Apps app_location path problems"
- "Azure deployment token invalid 2025"

## Notes for Next AI Session
- GitHub secrets are correct and verified
- Repository structure is in root (no FE/royal-code/ folder)
- Azure resources exist and are named correctly
- Deployment authorization policy is "GitHub" (this is correct)
- Focus on app_location paths and build output verification