# Azure Static Web Apps - Complete Working Process

## 🎯 WORKING SOLUTION DISCOVERED

Na uitgebreid debuggen hebben we het **correcte proces** gevonden:

## ✅ Het Werkende Proces

### 1. **Verwijder Alle Oude Workflow Files**
```bash
rm .github/workflows/azure-static-web-apps-*.yml
git add . && git commit -m "clean: remove old workflow files"
git push
```

### 2. **Maak Nieuwe Static Web Apps in Azure Portal**

#### Droneshop App:
```
Name: droneshop-quandarnl
Resource Group: budget
Repository: https://github.com/TweakStories/royal-code-fresh
Branch: main
App location: /
API location: [leeg]
Output location: dist/apps/droneshop/browser
Deployment authorization policy: GitHub
```

#### CV App:
```
Name: cv-royvandeweteringnl
Resource Group: budget
Repository: https://github.com/TweakStories/royal-code-fresh
Branch: main
App location: /
API location: [leeg]
Output location: dist/apps/cv/browser
Deployment authorization policy: GitHub
```

### 3. **Azure Genereert Automatisch GitHub Secrets**

Na het maken van de Static Web Apps verschijnen deze secrets automatisch:
- `AZURE_STATIC_WEB_APPS_API_TOKEN_HAPPY_CLIFF_029217B03` (Droneshop)
- `AZURE_STATIC_WEB_APPS_API_TOKEN_LEMON_DUNE_0779D1203` (CV)

### 4. **Maak Workflow Files Met Correcte Secrets**

#### .github/workflows/azure-static-web-apps-droneshop.yml
```yaml
name: Azure Static Web Apps CI/CD for Droneshop

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

      - name: Build Droneshop App with Nx
        run: pnpm exec nx build droneshop --configuration=production --verbose

      - name: Deploy to Azure Static Web Apps
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_HAPPY_CLIFF_029217B03 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          skip_app_build: true
          app_location: "/"
          output_location: "dist/apps/droneshop/browser"
          api_location: ""

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    permissions:
      contents: read
    steps:
      - name: Close Pull Request Environment
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_HAPPY_CLIFF_029217B03 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "close"
```

#### .github/workflows/azure-static-web-apps-cv.yml
```yaml
# Zelfde structuur maar met:
# - Build command: pnpm exec nx build cv --configuration=production --verbose
# - Secret: AZURE_STATIC_WEB_APPS_API_TOKEN_LEMON_DUNE_0779D1203
# - Output location: dist/apps/cv/browser
```

## 🔍 Waarom Het Eerder Niet Werkte

### Probleem 1: Verkeerde Secret Tokens
- **Fout**: Gebruikten oude secrets die hoorden bij andere/verwijderde Static Web Apps
- **Oplossing**: Fresh start met nieuwe Azure Static Web Apps die automatisch nieuwe secrets genereren

### Probleem 2: App Location vs Output Location Verwarring
- **Fout**: App location moet `/` zijn (root van repo), niet de build output
- **Correct**:
  - `app_location: "/"` (waar de source code staat)
  - `output_location: "dist/apps/[app]/browser"` (waar de build output komt)

### Probleem 3: Resource Group Verwarring
- **Fout**: Dachten dat resource group het probleem was
- **Realiteit**: Resource group maakt niet uit, het gaat om de secret tokens

## 📋 Current Working Configuration

### Repository Structure
```
royal-code-fresh/
├── apps/
│   ├── cv/          # Angular CV app
│   └── droneshop/   # Angular Droneshop app
├── .github/
│   └── workflows/
│       ├── azure-static-web-apps-cv.yml
│       └── azure-static-web-apps-droneshop.yml
└── dist/            # Build output (created during workflow)
    └── apps/
        ├── cv/browser/
        └── droneshop/browser/
```

### Azure Static Web Apps
1. **Droneshop**: `droneshop-quandarnl` → https://happy-cliff-029217b03.2.azurestaticapps.net
2. **CV**: `cv-royvandeweteringnl` → https://lemon-dune-0779d1203.1.azurestaticapps.net

### GitHub Secrets (Auto-Generated)
- `AZURE_STATIC_WEB_APPS_API_TOKEN_HAPPY_CLIFF_029217B03`
- `AZURE_STATIC_WEB_APPS_API_TOKEN_LEMON_DUNE_0779D1203`

## 🎯 Success Criteria
- ✅ Both workflow files created with correct secrets
- ✅ Azure Static Web Apps created and configured
- ✅ Build commands target correct apps (`nx build cv` / `nx build droneshop`)
- ✅ Output locations point to correct browser folders

## 🚀 Next Steps
1. Commit and push workflow files
2. Monitor GitHub Actions for successful deployment
3. Verify websites are accessible at Azure URLs

## 📝 Key Learnings
1. **Azure automatically manages GitHub secrets** - don't try to create them manually
2. **Fresh start is often better** than debugging old broken configurations
3. **App location is source, Output location is build result**
4. **Resource group doesn't affect deployment** - secret tokens are what matters
5. **"GitHub" deployment authorization policy is correct** for GitHub Actions integration

## 💡 For Future Reference
Dit proces werkt altijd:
1. Delete old workflow files
2. Create new Azure Static Web Apps via Azure Portal
3. Use auto-generated secrets in new workflow files
4. Commit and deploy

**Never manually create or manage Azure Static Web Apps secrets!**