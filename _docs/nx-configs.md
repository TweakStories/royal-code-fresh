--- START OF FILE .prettierrc ---
{
  "singleQuote": true
}
--- END OF FILE ---

--- START OF FILE apps/admin-panel-e2e/project.json ---
{
  "name": "admin-panel-e2e",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/admin-panel-e2e/src",
  "implicitDependencies": ["admin-panel"],
  "// targets": "to see all targets run: nx show project admin-panel-e2e --web",
  "targets": {}
}
--- END OF FILE ---

--- START OF FILE apps/admin-panel-e2e/tsconfig.json ---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "outDir": "../../dist/out-tsc",
    "sourceMap": false,
    "module": "commonjs",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "**/*.ts",
    "**/*.js",
    "playwright.config.ts",
    "src/**/*.spec.ts",
    "src/**/*.spec.js",
    "src/**/*.test.ts",
    "src/**/*.test.js",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/admin-panel/jest.config.ts ---
export default {
  displayName: 'admin-panel',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/admin-panel',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: [
  'node_modules/(?!.*\\.mjs$|@angular/common/locales)' 
],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE apps/admin-panel/project.json ---
{
  "name": "admin-panel",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "admin",
  "sourceRoot": "apps/admin-panel/src",
  "tags": ["scope:admin", "type:app", "context:admin"],
  "targets": {
    "build": {
      "executor": "@angular/build:application",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/admin-panel",
        "browser": "apps/admin-panel/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "apps/admin-panel/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/admin-panel/public"
          },
          {
            "glob": "**/*",
            "input": "libs/shared/assets/src/lib/i18n",
            "output": "/assets/i18n/"
          },
          {
            "glob": "**/*",
            "input": "apps/admin-panel/src/app/shared/assets/i18n",
            "output": "./assets/i18n"
          },
          {
            "glob": "**/*",
            "input": "apps/admin-panel/src/assets",
            "output": "assets/"
          },
          {
            "glob": "default-image.jpg",
            "input": "libs/shared/assets/src/lib/images",
            "output": "/"
          }
        ],
        "styles": ["libs/shared/styles/src/lib/theme.scss"],
        "stylePreprocessorOptions": {
          "includePaths": ["libs/shared/styles/src/lib"]
        },
        "scripts": []
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "4kb",
              "maximumError": "8kb"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "continuous": true,
      "executor": "@angular/build:dev-server",
      "configurations": {
        "production": {
          "buildTarget": "admin-panel:build:production"
        },
        "development": {
          "buildTarget": "admin-panel:build:development"
        }
      },
      "defaultConfiguration": "development"
    },
    "extract-i18n": {
      "executor": "@angular/build:extract-i18n",
      "options": {
        "buildTarget": "admin-panel:build"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/admin-panel/jest.config.ts"
      }
    },
    "serve-static": {
      "continuous": true,
      "executor": "@nx/web:file-server",
      "options": {
        "buildTarget": "admin-panel:build",
        "port": 4200,
        "staticFilePath": "dist/apps/admin-panel/browser",
        "spa": true
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE apps/admin-panel/tsconfig.app.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ],
  "exclude": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts"
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true,
    "strictInputTypes": true,
    "strictOutputEventTypes": true,
    "strictAttributeTypes": true,
    "strictDomEventTypes": true,
    "strictDomLocalRefTypes": true,
    "strictSafeNavigationTypes": true,
    "strictLiteralTypes": true
  }
}
--- END OF FILE ---

--- START OF FILE apps/admin-panel/tsconfig.json ---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "target": "es2023",
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "emitDecoratorMetadata": false,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [
    "src/**/*.ts"
  ], 
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE apps/admin-panel/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/challenger-e2e/project.json ---
{
  "name": "challenger-e2e",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/challenger-e2e/src",
  "implicitDependencies": ["challenger"],
  "// targets": "to see all targets run: nx show project challenger-e2e --web",
  "targets": {}
}
--- END OF FILE ---

--- START OF FILE apps/challenger-e2e/tsconfig.json ---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "outDir": "../../dist/out-tsc",
    "sourceMap": false,
    "module": "commonjs",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "**/*.ts",
    "**/*.js",
    "playwright.config.ts",
    "src/**/*.spec.ts",
    "src/**/*.spec.js",
    "src/**/*.test.ts",
    "src/**/*.test.js",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/challenger/jest.config.ts ---
export default {
  displayName: 'challenger',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE apps/challenger/project.json ---
{
  "name": "challenger",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app",
  "sourceRoot": "apps/challenger/src",
  "tags": [],
  "targets": {
    "build": {
      "executor": "@angular-devkit/build-angular:application",
      "outputs": ["{options.outputPath}"],
      "options": {
        "aot": true,
        "outputPath": "dist/apps/challenger",
        "index": "apps/challenger/src/index.html",
        "browser": "apps/challenger/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "apps/challenger/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          "apps/challenger/src/favicon.ico",
          {
            "glob": "**/*",
            "input": "apps/challenger/public",
            "output": "/"
          },
          {
            "glob": "**/*",
            "input": "libs/shared/assets/src/lib/i18n",
            "output": "assets/i18n/"
          },
          {
            "glob": "**/*",
            "input": "libs/features/avatar/src/lib/assets",
            "output": "assets/features/avatar/"
          },
          {
            "glob": "**/*",
            "input": "apps/challenger/src/assets",
            "output": "assets/"
          }
        ],
        "styles": [
          "node_modules/leaflet/dist/leaflet.css",
          "apps/challenger/src/styles.scss"
        ],
        "scripts": []
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "2mb",
              "maximumError": "3mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "4kb",
              "maximumError": "8kb"
            }
          ],
          "fileReplacements": [
            {
              "replace": "apps/challenger/src/environments/environment.ts",
              "with": "apps/challenger/src/environments/environment.prod.ts"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "executor": "@angular-devkit/build-angular:dev-server",
      "configurations": {
        "production": {
          "buildTarget": "challenger:build:production"
        },
        "development": {
          "buildTarget": "challenger:build:development"
        }
      },
      "defaultConfiguration": "development",
      "scripts": [],
      "continuous": true
    },
    "extract-i18n": {
      "executor": "@angular-devkit/build-angular:extract-i18n",
      "options": {
        "buildTarget": "challenger:build"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/challenger/jest.config.ts"
      }
    },
    "serve-static": {
      "executor": "@nx/web:file-server",
      "options": {
        "buildTarget": "challenger:build",
        "port": 4200,
        "staticFilePath": "dist/apps/challenger/browser",
        "spa": true
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE apps/challenger/tsconfig.app.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": [],
    "moduleResolution": "bundler"
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"],
  "exclude": ["jest.config.ts", "src/**/*.test.ts", "src/**/*.spec.ts"]
}
--- END OF FILE ---

--- START OF FILE apps/challenger/tsconfig.editor.json ---
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"],
  "compilerOptions": {},
  "exclude": ["jest.config.ts", "src/**/*.test.ts", "src/**/*.spec.ts"]
}
--- END OF FILE ---

--- START OF FILE apps/challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.editor.json"
    },
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE apps/challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/cv-e2e/project.json ---
{
  "name": "cv-e2e",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/cv-e2e/src",
  "implicitDependencies": ["cv"],
  "// targets": "to see all targets run: nx show project cv-e2e --web",
  "targets": {}
}
--- END OF FILE ---

--- START OF FILE apps/cv-e2e/tsconfig.json ---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "outDir": "../../dist/out-tsc",
    "sourceMap": false,
    "module": "commonjs",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "**/*.ts",
    "**/*.js",
    "playwright.config.ts",
    "src/**/*.spec.ts",
    "src/**/*.spec.js",
    "src/**/*.test.ts",
    "src/**/*.test.js",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/cv/jest.config.ts ---
export default {
  displayName: 'cv',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/cv',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE apps/cv/project.json ---
{
  "name": "cv",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app-cv",
  "sourceRoot": "apps/cv/src",
  "tags": ["scope:cv", "type:app"],
  "targets": {
    "build": {
      "executor": "@nx/angular:browser-esbuild",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/cv",
        "index": "apps/cv/src/index.html",
        "main": "apps/cv/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "apps/cv/tsconfig.app.json",
        "preserveSymlinks": true,
        "assets": [
          "apps/cv/src/favicon.ico",
          {
            "glob": "**/*",
            "input": "libs/shared/assets/src/lib/i18n",
            "output": "./assets/i18n"
          },
          {
            "glob": "**/*",
            "input": "apps/cv/src/app/shared/assets/i18n",
            "output": "./assets/i18n"
          },
          {
            "glob": "**/*",
            "input": "apps/cv/public",
            "output": "./"
          },
          {
            "glob": "staticwebapp.config.json",
            "input": "apps/cv/src",
            "output": "./"
          }
        ],
        "styles": [
          "apps/cv/src/tailwind.css",
          "apps/cv/src/styles.css",
          "libs/shared/styles/src/lib/theme.css"
        ],
        "scripts": []
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "4kb",
              "maximumError": "8kb"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "development"
    },
    "serve": {
      "executor": "@angular-devkit/build-angular:dev-server",
      "configurations": {
        "production": {
          "buildTarget": "cv:build:production"
        },
        "development": {
          "buildTarget": "cv:build:development"
        }
      },
      "defaultConfiguration": "development",
      "continuous": true
    },
    "extract-i18n": {
      "executor": "@angular-devkit/build-angular:extract-i18n",
      "options": {
        "buildTarget": "cv:build"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/cv/jest.config.ts"
      }
    },
    "serve-static": {
      "executor": "@nx/web:file-server",
      "options": {
        "buildTarget": "cv:build",
        "port": 4200,
        "staticFilePath": "dist/apps/cv/browser",
        "spa": true
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/tsconfig.app.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": [],
    "moduleResolution": "bundler"
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"],
  "exclude": ["jest.config.ts", "src/**/*.test.ts", "src/**/*.spec.ts"]
}
--- END OF FILE ---

--- START OF FILE apps/cv/tsconfig.editor.json ---
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"],
  "compilerOptions": {},
  "exclude": ["jest.config.ts", "src/**/*.test.ts", "src/**/*.spec.ts"]
}
--- END OF FILE ---

--- START OF FILE apps/cv/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.editor.json"
    },
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE apps/cv/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/droneshop-e2e/project.json ---
{
  "name": "droneshop-e2e",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/droneshop-e2e/src",
  "implicitDependencies": ["droneshop"],
  "// targets": "to see all targets run: nx show project droneshop-e2e --web",
  "targets": {}
}
--- END OF FILE ---

--- START OF FILE apps/droneshop-e2e/tsconfig.json ---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "outDir": "../../dist/out-tsc",
    "sourceMap": false,
    "module": "commonjs",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "**/*.ts",
    "**/*.js",
    "playwright.config.ts",
    "src/**/*.spec.ts",
    "src/**/*.spec.js",
    "src/**/*.test.ts",
    "src/**/*.test.js",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/droneshop/jest.config.ts ---
export default {
  displayName: 'droneshop',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE apps/droneshop/project.json ---
{
  "name": "droneshop",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "droneshop",
  "sourceRoot": "apps/droneshop/src",
  "tags": ["scope:droneshop", "type:app"],
  "targets": {
    "build": {
      "executor": "@angular/build:application",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/droneshop",
        "browser": "apps/droneshop/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "apps/droneshop/tsconfig.app.json",
        "inlineStyleLanguage": "css",
        "preserveSymlinks": true,
        "assets": [
          "apps/droneshop/src/favicon.ico",
          {
            "glob": "**/*",
            "input": "libs/shared/assets/src/lib/i18n",
            "output": "./assets/i18n/shared" 
          },
          {
            "glob": "**/*",
            "input": "apps/droneshop/src/app/shared/assets/i18n",
            "output": "./assets/i18n/droneshop" 
          },
          {
            "glob": "**/*",
            "input": "libs/features/avatar/src/lib/assets",
            "output": "/assets/features/avatar/"
          },
          {
            "glob": "**/*",
            "input": "apps/droneshop/public",
            "output": "./"
          }
        ],
        "styles": [
          "apps/droneshop/src/tailwind.css",
          "libs/shared/styles/src/lib/theme.css",
          "apps/droneshop/src/styles.css"
        ]
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "4kb",
              "maximumError": "8kb"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "development"
    },
    "serve": {
      "continuous": true,
      "executor": "@angular/build:dev-server",
      "options": {
        "proxyConfig": "apps/droneshop/src/proxy.conf.json"
      },
      "configurations": {
        "production": {
          "buildTarget": "droneshop:build:production"
        },
        "development": {
          "buildTarget": "droneshop:build:development"
        }
      },
      "defaultConfiguration": "development"
    },
    "extract-i18n": {
      "executor": "@angular/build:extract-i18n",
      "options": {
        "buildTarget": "droneshop:build"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/droneshop/jest.config.ts"
      }
    },
    "serve-static": {
      "continuous": true,
      "executor": "@nx/web:file-server",
      "options": {
        "buildTarget": "droneshop:build",
        "port": 4200,
        "staticFilePath": "dist/apps/droneshop/browser",
        "spa": true
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE apps/droneshop/project.json.backup ---
{
  "name": "cv",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app-cv",
  "sourceRoot": "apps/cv/src",
  "tags": ["scope:cv", "type:app"],
  "targets": {
    "build": {
       "executor": "@angular/build:application",
      "outputs": ["{options.outputPath}"],
      "dependsOn": [],
      "options": {
        "outputPath": "dist/apps/cv",
        "index": "apps/cv/src/index.html",
        "browser": "apps/cv/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "apps/cv/tsconfig.app.json",
        "allowedCommonJsDependencies": ["deepmerge"],
        "inlineStyleLanguage": "scss",
        "assets": [
          "apps/cv/src/favicon.ico",
          {
            "glob": "**/*",
            "input": "libs/shared/assets/src/lib/i18n",
            "output": "./assets/i18n"
          },
          {
            "glob": "**/*",
            "input": "apps/cv/src/app/shared/assets/i18n",
            "output": "./assets/i18n"
          },
          {
            "glob": "**/*",
            "input": "apps/cv/public",
            "output": "./"
          },
          {
            "glob": "staticwebapp.config.json",
            "input": "apps/cv/src",
            "output": "./"
          }
        ],
        "styles": [
          "apps/cv/src/styles.scss",
          "libs/shared/styles/src/lib/theme.scss"
        ],
        "scripts": []
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "2mb",
              "maximumError": "5mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "20kb",
              "maximumError": "50kb"
            }
          ],
          "outputHashing": "all",
          "sourceMap": false,
          "optimization": true
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "executor": "@angular-devkit/build-angular:dev-server",
      "configurations": {
        "production": {
          "buildTarget": "cv:build:production"
        },
        "development": {
          "buildTarget": "cv:build:development"
        }
      },
      "defaultConfiguration": "development",
      "continuous": true
    },
    "extract-i18n": {
      "executor": "@angular-devkit/build-angular:extract-i18n",
      "options": {
        "buildTarget": "cv:build"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/cv/jest.config.ts"
      }
    },
    "serve-static": {
      "executor": "@nx/web:file-server",
      "options": {
        "buildTarget": "cv:build",
        "port": 4200,
        "staticFilePath": "dist/apps/cv/browser",
        "spa": true
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE apps/droneshop/tsconfig.app.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": [],
    "moduleResolution": "bundler"
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"],
  "exclude": ["jest.config.ts", "src/**/*.test.ts", "src/**/*.spec.ts"]
}
--- END OF FILE ---

--- START OF FILE apps/droneshop/tsconfig.editor.json ---
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"],
  "compilerOptions": {},
  "exclude": ["jest.config.ts", "src/**/*.test.ts", "src/**/*.spec.ts"]
}
--- END OF FILE ---

--- START OF FILE apps/droneshop/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.editor.json"
    },
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE apps/droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/plushie-paradise-e2e/project.json ---
{
  "name": "plushie-paradise-e2e",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/plushie-paradise-e2e/src",
  "implicitDependencies": ["plushie-paradise"],
  "// targets": "to see all targets run: nx show project plushie-paradise-e2e --web",
  "targets": {}
}
--- END OF FILE ---

--- START OF FILE apps/plushie-paradise-e2e/tsconfig.json ---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "outDir": "../../dist/out-tsc",
    "sourceMap": false,
    "module": "commonjs",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "**/*.ts",
    "**/*.js",
    "playwright.config.ts",
    "src/**/*.spec.ts",
    "src/**/*.spec.js",
    "src/**/*.test.ts",
    "src/**/*.test.js",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE apps/plushie-paradise/jest.config.ts ---
export default {
  displayName: 'plushie-paradise',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/plushie-paradise',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE apps/plushie-paradise/project.json ---
{
  "name": "plushie-paradise",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app",
  "sourceRoot": "apps/plushie-paradise/src",
  "tags": ["scope:app", "type:app", "project:plushie-paradise"],
  "targets": {
    "build": {
      "executor": "@angular-devkit/build-angular:application",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/plushie-paradise",
        "index": "apps/plushie-paradise/src/index.html",
        "browser": "apps/plushie-paradise/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "apps/plushie-paradise/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/plushie-paradise/public"
          },
          {
            "glob": "**/*",
            "input": "libs/shared/assets/src/lib/i18n",
            "output": "/assets/i18n/"
          },
          {
            "glob": "**/*",
            "input": "libs/features/avatar/src/lib/assets",
            "output": "/assets/features/avatar/"
          },
          {
            "glob": "**/*",
            "input": "apps/plushie-paradise/src/assets",
            "output": "assets/"
          }
        ],
        "styles": [
          "node_modules/leaflet/dist/leaflet.css",
          "libs/shared/styles/src/lib/theme.scss"
        ],
        "stylePreprocessorOptions": {
          "includePaths": ["libs/shared/styles/src/lib"]
        },
        "scripts": []
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "4kb",
              "maximumError": "8kb"
            }
          ],
          "fileReplacements": [
            {
              "replace": "apps/plushie-paradise/src/environments/environment.ts",
              "with": "apps/plushie-paradise/src/environments/environment.prod.ts"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "continuous": true,
      "executor": "@angular-devkit/build-angular:dev-server",
      "configurations": {
        "production": {
          "buildTarget": "plushie-paradise:build:production"
        },
        "development": {
          "buildTarget": "plushie-paradise:build:development"
        }
      },
      "defaultConfiguration": "development"
    },
    "extract-i18n": {
      "executor": "@angular-devkit/build-angular:extract-i18n",
      "options": {
        "buildTarget": "plushie-paradise:build"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/plushie-paradise/jest.config.ts"
      }
    },
    "serve-static": {
      "continuous": true,
      "executor": "@nx/web:file-server",
      "options": {
        "buildTarget": "plushie-paradise:build",
        "port": 4200,
        "staticFilePath": "dist/apps/plushie-paradise/browser",
        "spa": true
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE apps/plushie-paradise/tsconfig.app.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": ["node"],
    "moduleResolution": "bundler"
  },
  "files": ["src/main.ts", "src/main.server.ts", "src/server.ts"],
  "include": ["src/**/*.d.ts"],
  "exclude": ["jest.config.ts", "src/**/*.test.ts", "src/**/*.spec.ts"]
}
--- END OF FILE ---

--- START OF FILE apps/plushie-paradise/tsconfig.editor.json ---
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"],
  "compilerOptions": {},
  "exclude": ["jest.config.ts", "src/**/*.test.ts", "src/**/*.spec.ts"]
}
--- END OF FILE ---

--- START OF FILE apps/plushie-paradise/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.editor.json"
    },
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE apps/plushie-paradise/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE jest.config.ts ---
import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  projects: await getJestProjectsAsync(),
});
--- END OF FILE ---

--- START OF FILE libs/auth/data-access/jest.config.ts ---
export default {
  displayName: 'auth-data-access',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/auth/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/auth/data-access/project.json ---
{
  "name": "auth-data-access",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/auth/data-access/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["type:data-access", "scope:auth"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/auth/data-access/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/auth/data-access/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/auth/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/auth/domain/jest.config.ts ---
export default {
  displayName: 'auth-domain',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/auth/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/auth/domain/package.json ---
{
  "name": "@royal-code/auth/domain",
  "version": "0.0.1",
  "type": "commonjs"
}
--- END OF FILE ---

--- START OF FILE libs/auth/domain/project.json ---
{
  "name": "auth-domain",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/auth/domain/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["type:domain", "scope:auth"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/auth/domain/ng-package.json",
        "tsConfig": "libs/auth/domain/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/auth/domain/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/auth/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/auth/domain/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/auth/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/config/jest.config.ts ---
export default {
  displayName: 'config',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/core/config',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/core/config/package.json ---
{
  "name": "@royal-code/core/config",
  "version": "0.0.1",
  "type": "commonjs"
}
--- END OF FILE ---

--- START OF FILE libs/core/config/project.json ---
{
  "name": "config",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/core/config/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["type:core", "scope:core-config"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/core/config/ng-package.json",
        "tsConfig": "libs/core/config/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/core/config/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/core/config/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/config/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/config/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/core-logging/jest.config.ts ---
export default {
  displayName: 'core-logging',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/core/core-logging',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/core/core-logging/package.json ---
{
    "name":  "@royal-code/core/core-logging",
    "version":  "0.0.1",
    "sideEffects":  false,
    "type":  "module",
    "license":  "MIT"
}
--- END OF FILE ---

--- START OF FILE libs/core/core-logging/project.json ---
{
  "name": "core-logging",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/core/core-logging/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/core/core-logging/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/core/core-logging/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/core/core-logging/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/core/core-logging/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/core-logging/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/core-logging/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/error-handling/jest.config.ts ---
export default {
  displayName: 'error-handling',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/core/error-handling',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/core/error-handling/project.json ---
{
  "name": "error-handling",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/core/error-handling/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/core/error-handling/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/error-handling/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/error-handling/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/http/jest.config.ts ---
export default {
  displayName: 'core-http',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/core/http',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/core/http/project.json ---
{
  "name": "core-http",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/core/http/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:core", "context:http"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/core/http/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/http/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/http/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/data-access/jest.config.ts ---
export default {
  displayName: 'data-access',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/core/navigation/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/core/navigation/data-access/project.json ---
{
  "name": "navigation-data-access",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/core/navigation/data-access/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["type:data-access", "scope:core-nav"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/core/navigation/data-access/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/data-access/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/jest.config.ts ---
export default {
  displayName: 'navigation-state',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/core/navigation/state',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/project.json ---
{
  "name": "navigation-state",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/core/navigation/state/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["type:state", "scope:core-nav"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/core/navigation/state/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/navigation/state/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/routing/jest.config.ts ---
export default {
  displayName: 'routing',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/core/routing',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/core/routing/project.json ---
{
  "name": "routing",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/core/routing/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["type:core", "scope:core-routing"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/core/routing/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/routing/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/routing/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/core/storage/jest.config.ts ---
export default {
  displayName: 'storage',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/core/storage',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/core/storage/package.json ---
{
    "name": "@royal-code/core/storage",
    "version": "0.0.1",
    "peerDependencies": {
        
        
        "@royal-code/core/core-logging": "workspace:*"
    },
    "sideEffects": false,
    "type": "module"
}
--- END OF FILE ---

--- START OF FILE libs/core/storage/project.json ---
{
  "name": "storage",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/core/storage/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["type:core", "scope:core-storage"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/core/storage/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/core/storage/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/core/storage/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/core/storage/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/storage/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/core/storage/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/account/core/jest.config.ts ---
export default {
  displayName: 'account-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/account/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/account/core/package.json ---
{
  "name": "@royal-code/features/account/core",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/features/account/core/project.json ---
{
  "name": "features-account-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/account/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:account", "type:feature-core"],
    "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/account/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/account/core/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/account/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/account/data-access-droneshop/jest.config.ts ---
export default {
  displayName: 'account-data-access-droneshop',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/account/data-access-droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/account/data-access-droneshop/project.json ---
{
  "name": "account-data-access-droneshop",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/account/data-access-droneshop/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:data-access", "context:account"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/account/data-access-droneshop/jest.config.ts",
        "tsConfig": "libs/features/account/data-access-droneshop/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/account/data-access-droneshop/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/account/data-access-droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/account/domain/jest.config.ts ---
export default {
  displayName: 'account-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/account/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/account/domain/project.json ---
{
  "name": "account-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/account/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:account"],
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/features/account/domain",
        "main": "libs/features/account/domain/src/index.ts",
        "tsConfig": "libs/features/account/domain/tsconfig.lib.json",
        "assets": ["libs/features/account/domain/*.md"]
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/account/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/account/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/account/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/account/ui-droneshop/jest.config.ts ---
export default {
  displayName: 'account-ui-droneshop',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/account/ui-droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/account/ui-droneshop/project.json ---
{
  "name": "account-ui-droneshop",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/account/ui-droneshop/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:feature", "context:account"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/account/ui-droneshop/jest.config.ts",
        "tsConfig": "libs/features/account/ui-droneshop/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/account/ui-droneshop/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/account/ui-droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/achievements/jest.config.ts ---
export default {
  displayName: 'achievements',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/achievements',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/achievements/project.json ---
{
  "name": "achievements",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/achievements/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:gamification"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/achievements/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/achievements/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/achievements/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/core/jest.config.ts ---
export default {
  displayName: 'admin-dashboard-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-dashboard/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/core/project.json ---
{
  "name": "admin-dashboard-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-dashboard/core/src",
  "prefix": "admin",
  "projectType": "library",
  "tags": ["scope:admin-panel", "type:feature-core", "context:admin-dashboard"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-dashboard/core/jest.config.ts",
        "tsConfig": "libs/features/admin-dashboard/core/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/data-access/jest.config.ts ---
export default {
  displayName: 'admin-dashboard-data-access',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/admin-dashboard/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/data-access/project.json ---
{
  "name": "admin-dashboard-data-access",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-dashboard/data-access/src",
  "prefix": "admin",
  "projectType": "library",
  "tags": ["scope:admin-panel", "type:data-access", "context:admin-dashboard"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-dashboard/data-access/jest.config.ts",
        "tsConfig": "libs/features/admin-dashboard/data-access/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/data-access/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/domain/jest.config.ts ---
export default {
  displayName: 'admin-dashboard-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/admin-dashboard/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/domain/project.json ---
{
  "name": "admin-dashboard-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-dashboard/domain/src",
  "prefix": "admin",
  "projectType": "library",
  "tags": ["scope:admin-panel", "type:domain", "context:admin-dashboard"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-dashboard/domain/jest.config.ts",
        "tsConfig": "libs/features/admin-dashboard/domain/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-dashboard/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/core/jest.config.ts ---
export default {
  displayName: 'admin-orders-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-orders/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/core/project.json ---
{
  "name": "admin-orders-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-orders/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:feature-core", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-orders/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/data-access/jest.config.ts ---
export default {
  displayName: 'admin-orders-data-access',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/admin-orders/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/data-access/project.json ---
{
  "name": "admin-orders-data-access",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-orders/data-access/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:data-access", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-orders/data-access/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/data-access/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/domain/jest.config.ts ---
export default {
  displayName: 'admin-orders-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-orders/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/domain/project.json ---
{
  "name": "admin-orders-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-orders/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:domain", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-orders/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/ui/jest.config.ts ---
export default {
  displayName: 'admin-orders-ui',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-orders/ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/ui/project.json ---
{
  "name": "admin-orders-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-orders/ui/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:feature", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-orders/ui/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/ui/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-orders/ui/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/core/jest.config.ts ---
export default {
  displayName: 'admin-products-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-products/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/core/project.json ---
{
  "name": "admin-products-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-products/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:feature-core", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-products/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/data-access/jest.config.ts ---
export default {
  displayName: 'admin-products-data-access',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/admin-products/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/data-access/package.json ---
{
  "name": "@royal-code/features/admin-products/data-access",
  "version": "0.0.1",
  "type": "module",
  "license": "MIT",
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/data-access/project.json ---
{
  "name": "admin-products-data-access",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-products/data-access/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:data-access", "context:products"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/features/admin-products/data-access/ng-package.json",
        "tsConfig": "libs/features/admin-products/data-access/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/features/admin-products/data-access/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-products/data-access/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/data-access/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/domain/jest.config.ts ---
export default {
  displayName: 'admin-products-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-products/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/domain/package.json ---
{
  "name": "@royal-code/features/admin-products/domain",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@royal-code/shared/domain": "workspace:*"
  },
  "sideEffects": false,
  "type": "module"
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/domain/project.json ---
{
  "name": "admin-products-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-products/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:domain", "context:products"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/features/admin-products/domain/ng-package.json",
        "tsConfig": "libs/features/admin-products/domain/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/features/admin-products/domain/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-products/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/ui/jest.config.ts ---
export default {
  displayName: 'admin-products-ui',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-products/ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/ui/project.json ---
{
  "name": "admin-products-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-products/ui/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:feature", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-products/ui/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/ui/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-products/ui/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/core/jest.config.ts ---
export default {
  displayName: 'admin-reviews-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-reviews/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/core/project.json ---
{
  "name": "admin-reviews-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-reviews/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:admin-reviews"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-reviews/core/jest.config.ts",
        "tsConfig": "libs/features/admin-reviews/core/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/data-access/jest.config.ts ---
export default {
  displayName: 'admin-reviews-data-access',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/admin-reviews/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/data-access/project.json ---
{
  "name": "admin-reviews-data-access",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-reviews/data-access/src",
  "prefix": "admin",
  "projectType": "library",
  "tags": ["scope:admin-panel", "type:data-access", "context:admin-reviews"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-reviews/data-access/jest.config.ts",
        "tsConfig": "libs/features/admin-reviews/data-access/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/data-access/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/domain/jest.config.ts ---
export default {
  displayName: 'admin-reviews-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-reviews/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/domain/project.json ---
{
  "name": "admin-reviews-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-reviews/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:admin-reviews"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-reviews/domain/jest.config.ts",
        "tsConfig": "libs/features/admin-reviews/domain/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/ui/jest.config.ts ---
export default {
  displayName: 'admin-reviews-ui',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-reviews/ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/ui/project.json ---
{
  "name": "admin-reviews-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-reviews/ui/src",
  "prefix": "admin",
  "projectType": "library",
  "tags": ["scope:admin-panel", "type:feature", "context:admin-reviews"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-reviews/ui/jest.config.ts",
        "tsConfig": "libs/features/admin-reviews/ui/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/ui/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-reviews/ui/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/core/jest.config.ts ---
export default {
  displayName: 'admin-users-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-users/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/core/project.json ---
{
  "name": "admin-users-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-users/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:feature-core", "context:users"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-users/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/data-access/jest.config.ts ---
export default {
  displayName: 'admin-users-data-access',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/admin-users/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/data-access/project.json ---
{
  "name": "admin-users-data-access",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-users/data-access/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:data-access", "context:users"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-users/data-access/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/data-access/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/domain/jest.config.ts ---
export default {
  displayName: 'admin-users-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-users/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/domain/project.json ---
{
  "name": "admin-users-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-users/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:domain", "context:users"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-users/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/ui/jest.config.ts ---
export default {
  displayName: 'admin-users-ui',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-users/ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/ui/project.json ---
{
  "name": "admin-users-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-users/ui/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:feature", "context:users"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-users/ui/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/ui/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-users/ui/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/core/jest.config.ts ---
export default {
  displayName: 'admin-variants-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-variants/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/core/project.json ---
{
  "name": "admin-variants-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-variants/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:feature-core", "context:variants"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-variants/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/data-access/jest.config.ts ---
export default {
  displayName: 'admin-variants-data-access',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/admin-variants/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/data-access/project.json ---
{
  "name": "admin-variants-data-access",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-variants/data-access/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:data-access", "context:variants"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-variants/data-access/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/data-access/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/ui/jest.config.ts ---
export default {
  displayName: 'admin-variants-ui',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/admin-variants/ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/ui/project.json ---
{
  "name": "admin-variants-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/admin-variants/ui/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:admin", "type:feature", "context:variants"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/admin-variants/ui/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/ui/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/admin-variants/ui/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/ai-companion/jest.config.ts ---
export default {
  displayName: 'ai-companion',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/ai-companion',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/ai-companion/project.json ---
{
  "name": "ai-companion",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/ai-companion/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:ai"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/ai-companion/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/ai-companion/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/ai-companion/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/authentication/jest.config.ts ---
export default {
  displayName: 'authentication',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/authentication',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/authentication/project.json ---
{
  "name": "authentication",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/authentication/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["type:feature", "scope:auth"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/authentication/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/authentication/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/authentication/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/avatar-customization/jest.config.ts ---
export default {
  displayName: 'avatar-customization',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/avatar-customization',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/avatar-customization/project.json ---
{
  "name": "avatar-customization",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/avatar-customization/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:avatar"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/avatar-customization/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/avatar-customization/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/avatar-customization/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/avatar/jest.config.ts ---
export default {
  displayName: 'avatar',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/avatar',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/avatar/project.json ---
{
  "name": "avatar",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/avatar/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/avatar/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/avatar/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/avatar/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/core/jest.config.ts ---
export default {
  displayName: 'cart-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/cart/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/cart/core/package.json ---
{
  "name": "@royal-code/features/cart/core",
  "version": "0.0.1",
  "type": "commonjs"
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/core/project.json ---
{
  "name": "features-cart-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/cart/core/src",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:cart"],
  "implicitDependencies": [
    "cart-domain",
    "features-products-core",
    "auth",
    "core-logging",
    "storage",
    "error",
    "ui-notifications"
  ],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/cart/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/core/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json"
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-challenger/jest.config.ts ---
export default {
  displayName: 'feature-cart-data-access-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/cart/data-access-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-challenger/project.json ---
{
  "name": "feature-cart-data-access-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/cart/data-access-challenger/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["scope:challenger", "type:data-access", "context:cart"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/cart/data-access-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-plushie/jest.config.ts ---
export default {
  displayName: 'feature-cart-data-access-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/cart/data-access-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-plushie/project.json ---
{
  "name": "feature-cart-data-access-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/cart/data-access-plushie/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:data-access", "context:cart"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/cart/data-access-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-plushie/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/data-access-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/domain/jest.config.ts ---
export default {
  displayName: 'cart-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/cart/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/cart/domain/package.json ---
{
  "name": "@royal-code/features/cart/domain",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@royal-code/shared/domain": "workspace:*"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false,
  "type": "module"
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/domain/project.json ---
{
  "name": "cart-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/cart/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:cart"],
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/features/cart/domain",
        "main": "libs/features/cart/domain/src/index.ts",
        "tsConfig": "libs/features/cart/domain/tsconfig.lib.json",
        "assets": []
      },
      "configurations": {
        "production": {
          "declaration": true,
          "declarationMap": true
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/cart/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/ui-challenger/jest.config.ts ---
export default {
  displayName: 'feature-cart-ui-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/cart/ui-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/cart/ui-challenger/project.json ---
{
  "name": "feature-cart-ui-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/cart/ui-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:ui", "context:cart"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/cart/ui-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/ui-challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/ui-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/ui-plushie/jest.config.ts ---
export default {
  displayName: 'cart-ui-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/cart/ui-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/cart/ui-plushie/project.json ---
{
  "name": "feature-cart-ui-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/cart/ui-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:ui", "context:cart"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/cart/ui-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/ui-plushie/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/cart/ui-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/challenges/jest.config.ts ---
export default {
  displayName: 'challenges',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/challenges',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/challenges/project.json ---
{
  "name": "challenges",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/challenges/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/challenges/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/challenges/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/challenges/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/character-progression/jest.config.ts ---
export default {
  displayName: 'character-progression',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/character-progression',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/character-progression/project.json ---
{
  "name": "character-progression",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/character-progression/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:character"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/character-progression/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/character-progression/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/character-progression/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/core/jest.config.ts ---
export default {
  displayName: 'chat-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/chat/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/chat/core/project.json ---
{
  "name": "chat-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/chat/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:chat"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/chat/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/data-access-plushie/jest.config.ts ---
export default {
  displayName: 'chat-data-access-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/chat/data-access-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/chat/data-access-plushie/project.json ---
{
  "name": "chat-data-access-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/chat/data-access-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:data-access", "context:chat"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/chat/data-access-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/data-access-plushie/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/data-access-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/domain/jest.config.ts ---
export default {
  displayName: 'chat-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/chat/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/chat/domain/project.json ---
{
  "name": "chat-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/chat/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:chat"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/chat/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/ui-challenger/jest.config.ts ---
export default {
  displayName: 'chat-ui-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/chat/ui-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/chat/ui-challenger/project.json ---
{
  "name": "chat-ui-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/chat/ui-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:feature", "context:chat"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/chat/ui-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/ui-challenger/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/ui-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/ui-plushie/jest.config.ts ---
export default {
  displayName: 'chat-ui-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/chat/ui-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/chat/ui-plushie/project.json ---
{
  "name": "chat-ui-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/chat/ui-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:feature", "context:chat"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/chat/ui-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/ui-plushie/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/chat/ui-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/jest.config.ts ---
export default {
  displayName: 'features-checkout-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/checkout/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/project.json ---
{
  "name": "features-checkout-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/checkout/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:checkout", "type:feature-core"],
  "implicitDependencies": [
    "checkout-domain",
    "features-cart-core",
    "orders-domain",
    "orders-core",
    "user",
    "storage",
    "core-logging",
    "ui-notifications"
  ],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/checkout/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-challenger/jest.config.ts ---
export default {
  displayName: 'data-access-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/checkout/data-access-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-challenger/project.json ---
{
  "name": "features-checkout-data-access-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/checkout/data-access-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:data-access", "context:checkout"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/checkout/data-access-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-plushie/jest.config.ts ---
export default {
  displayName: 'data-access-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/checkout/data-access-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-plushie/project.json ---
{
  "name": "features-checkout-data-access-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/checkout/data-access-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:data-access", "context:checkout"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/checkout/data-access-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-plushie/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/domain/jest.config.ts ---
export default {
  displayName: 'checkout-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/checkout/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/checkout/domain/project.json ---
{
  "name": "checkout-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/checkout/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:checkout"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/checkout/domain/jest.config.ts",
        "tsConfig": "libs/features/checkout/domain/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-challenger/jest.config.ts ---
export default {
  displayName: 'ui-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/checkout/ui-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-challenger/project.json ---
{
  "name": "features-checkout-ui-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/checkout/ui-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:feature", "context:checkout"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/checkout/ui-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/jest.config.ts ---
export default {
  displayName: 'ui-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/checkout/ui-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/project.json ---
{
  "name": "features-checkout-ui-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/checkout/ui-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:feature", "context:checkout"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/checkout/ui-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/crafting/jest.config.ts ---
export default {
  displayName: 'crafting',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/crafting',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/crafting/project.json ---
{
  "name": "crafting",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/crafting/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:item"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/crafting/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/crafting/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/crafting/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/core/jest.config.ts ---
export default {
  displayName: 'guides-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/guides/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/guides/core/project.json ---
{
  "name": "guides-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/guides/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:guides"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/guides/core/jest.config.ts",
        "tsConfig": "libs/features/guides/core/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/data-access-droneshop/jest.config.ts ---
export default {
  displayName: 'guides-data-access-droneshop',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/guides/data-access-droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/guides/data-access-droneshop/project.json ---
{
  "name": "guides-data-access-droneshop",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/guides/data-access-droneshop/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:data-access", "context:guides"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/guides/data-access-droneshop/jest.config.ts",
        "tsConfig": "libs/features/guides/data-access-droneshop/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/data-access-droneshop/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/data-access-droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/domain/jest.config.ts ---
export default {
  displayName: 'guides-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/guides/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/guides/domain/project.json ---
{
  "name": "guides-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/guides/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:guides"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/guides/domain/jest.config.ts",
        "tsConfig": "libs/features/guides/domain/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/ui-droneshop/jest.config.ts ---
export default {
  displayName: 'guides-ui-droneshop',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/guides/ui-droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/guides/ui-droneshop/project.json ---
{
  "name": "guides-ui-droneshop",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/guides/ui-droneshop/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:feature", "context:guides"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/guides/ui-droneshop/jest.config.ts",
        "tsConfig": "libs/features/guides/ui-droneshop/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/ui-droneshop/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guides/ui-droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/guilds/jest.config.ts ---
export default {
  displayName: 'guilds',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/guilds',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/guilds/project.json ---
{
  "name": "guilds",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/guilds/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:social"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/guilds/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/guilds/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/guilds/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/inventory-equipment/jest.config.ts ---
export default {
  displayName: 'inventory-equipment',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/inventory-equipment',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/inventory-equipment/project.json ---
{
  "name": "inventory-equipment",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/inventory-equipment/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:item"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/inventory-equipment/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/inventory-equipment/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/inventory-equipment/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/leaderboards/jest.config.ts ---
export default {
  displayName: 'leaderboards',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/leaderboards',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/leaderboards/project.json ---
{
  "name": "leaderboards",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/leaderboards/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:gamification"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/leaderboards/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/leaderboards/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/leaderboards/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/core/jest.config.ts ---
export default {
  displayName: 'media-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/media/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/media/core/package.json ---
{
  "name": "@royal-code/features/media/core",
  "version": "0.0.1",
  "type": "commonjs"
}
--- END OF FILE ---

--- START OF FILE libs/features/media/core/project.json ---
{
  "name": "media-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/media/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:media"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/features/media/core/ng-package.json",
        "tsConfig": "libs/features/media/core/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/features/media/core/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/media/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/media/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/data-access-challenger/jest.config.ts ---
export default {
  displayName: 'media-data-access-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/media/data-access-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/media/data-access-challenger/project.json ---
{
  "name": "media-data-access-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/media/data-access-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:data-access", "context:media"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/media/data-access-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/media/data-access-challenger/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/data-access-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/data-access-plushie/jest.config.ts ---
export default {
  displayName: 'media-data-access-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/media/data-access-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/media/data-access-plushie/project.json ---
{
  "name": "media-data-access-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/media/data-access-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:data-access", "context:media"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/media/data-access-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/media/data-access-plushie/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/data-access-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/domain/jest.config.ts ---
export default {
  displayName: 'media-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/media/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/media/domain/package.json ---
{
    "name": "@royal-code/features/media/domain",
    "version": "0.0.1",
    "sideEffects": false,
    "type": "module",
    "license": "MIT",
    "peerDependencies": {
      "@royal-code/shared/domain": "workspace:*",
      "@royal-code/shared/base-models": "workspace:*"
    }
}
--- END OF FILE ---

--- START OF FILE libs/features/media/domain/project.json ---
{
  "name": "media-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/media/domain/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:domain", "scope:features-media"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/features/media/domain/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/features/media/domain/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/features/media/domain/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/media/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/media/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/ui-challenger/jest.config.ts ---
export default {
  displayName: 'media-ui-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/media/ui-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/media/ui-challenger/project.json ---
{
  "name": "media-ui-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/media/ui-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:feature", "context:media"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/media/ui-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/media/ui-challenger/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/ui-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/ui-plushie/jest.config.ts ---
export default {
  displayName: 'media-ui-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/media/ui-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/media/ui-plushie/project.json ---
{
  "name": "media-ui-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/media/ui-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:feature", "context:media"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/media/ui-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/media/ui-plushie/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/media/ui-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/nodes/jest.config.ts ---
export default {
  displayName: 'nodes',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/nodes',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/nodes/project.json ---
{
  "name": "nodes",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/nodes/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/nodes/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/nodes/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/nodes/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/core/jest.config.ts ---
export default {
  displayName: 'orders-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/orders/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/orders/core/project.json ---
{
  "name": "orders-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/orders/core/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/orders/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/data-access-challenger/jest.config.ts ---
export default {
  displayName: 'orders-data-access-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/orders/data-access-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/orders/data-access-challenger/project.json ---
{
  "name": "orders-data-access-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/orders/data-access-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:data-access", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/orders/data-access-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/data-access-challenger/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/data-access-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/data-access-plushie/jest.config.ts ---
export default {
  displayName: 'orders-data-access-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/orders/data-access-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/orders/data-access-plushie/project.json ---
{
  "name": "orders-data-access-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/orders/data-access-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:data-access", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/orders/data-access-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/data-access-plushie/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/data-access-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/domain/jest.config.ts ---
export default {
  displayName: 'orders-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/orders/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/orders/domain/project.json ---
{
  "name": "orders-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/orders/domain/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/orders/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/ui-challenger/jest.config.ts ---
export default {
  displayName: 'orders-ui-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/orders/ui-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/orders/ui-challenger/project.json ---
{
  "name": "orders-ui-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/orders/ui-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:feature", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/orders/ui-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/ui-challenger/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/ui-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/ui-plushie/jest.config.ts ---
export default {
  displayName: 'orders-ui-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/orders/ui-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/orders/ui-plushie/project.json ---
{
  "name": "orders-ui-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/orders/ui-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:feature", "context:orders"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/orders/ui-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/ui-plushie/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/orders/ui-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/party/jest.config.ts ---
export default {
  displayName: 'party',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/party',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/party/project.json ---
{
  "name": "party",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/party/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:social"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/party/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/party/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/party/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/core/jest.config.ts ---
export default {
  displayName: 'features-products-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/products/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/products/core/package.json ---
{
  "name": "@royal-code/features/products/core",
  "version": "0.0.1",
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false,
  "type": "module"
}
--- END OF FILE ---

--- START OF FILE libs/features/products/core/project.json ---
{
  "name": "features-products-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/products/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:products"],
  "implicitDependencies": [
    "products-domain",
    "reviews-domain"
  ],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/features/products/core/ng-package.json",
        "tsConfig": "libs/features/products/core/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/features/products/core/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/products/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/core/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-challenger/jest.config.ts ---
export default {
  displayName: 'data-access-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/products/data-access-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-challenger/project.json ---
{
  "name": "data-access-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/products/data-access-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:data-access", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/products/data-access-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-droneshop/jest.config.ts ---
export default {
  displayName: 'products-data-access-droneshop',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/products/data-access-droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-droneshop/project.json ---
{
  "name": "products-data-access-droneshop",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/products/data-access-droneshop/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:data-access", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/products/data-access-droneshop/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-droneshop/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-plushie/jest.config.ts ---
export default {
  displayName: 'data-access-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/products/data-access-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-plushie/project.json ---
{
  "name": "data-access-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/products/data-access-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:data-access", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/products/data-access-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-plushie/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/data-access-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/domain/jest.config.ts ---
export default {
  displayName: 'products-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/products/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/products/domain/package.json ---
{
  "name": "@royal-code/features/products/domain",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@royal-code/shared/domain": "workspace:*"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false,
  "type": "module"
}
--- END OF FILE ---

--- START OF FILE libs/features/products/domain/project.json ---
{
  "name": "products-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/products/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:products"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/features/products/domain/ng-package.json",
        "tsConfig": "libs/features/products/domain/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/features/products/domain/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/products/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/domain/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-challenger/jest.config.ts ---
export default {
  displayName: 'ui-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/products/ui-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-challenger/project.json ---
{
  "name": "ui-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/products/ui-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:feature", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/products/ui-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-droneshop/jest.config.ts ---
export default {
  displayName: 'products-ui-droneshop',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/products/ui-droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-droneshop/project.json ---
{
  "name": "products-ui-droneshop",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/products/ui-droneshop/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:feature", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/products/ui-droneshop/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-droneshop/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-plushie/jest.config.ts ---
export default {
  displayName: 'ui-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/products/ui-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-plushie/project.json ---
{
  "name": "ui-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/products/ui-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:feature", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/products/ui-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-plushie/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/products/ui-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/progression/jest.config.ts ---
export default {
  displayName: 'progression',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/progression',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/progression/project.json ---
{
  "name": "progression",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/progression/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/progression/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/progression/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/progression/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/quests/jest.config.ts ---
export default {
  displayName: 'quests',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/quests',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/quests/project.json ---
{
  "name": "quests",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/quests/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/quests/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/quests/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/quests/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/core/jest.config.ts ---
export default {
  displayName: 'features-reviews-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/reviews/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/reviews/core/project.json ---
{
  "name": "features-reviews-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/reviews/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:reviews"],
  "implicitDependencies": [
    "reviews-domain",
    "error"
  ],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/reviews/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/core/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/data-access-challenger/jest.config.ts ---
export default {
  displayName: 'reviews-data-access-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/reviews/data-access-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/reviews/data-access-challenger/project.json ---
{
  "name": "reviews-data-access-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/reviews/data-access-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:data-access", "context:reviews"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/reviews/data-access-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/data-access-challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/data-access-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/data-access-plushie/jest.config.ts ---
export default {
  displayName: 'reviews-data-access-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/reviews/data-access-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/reviews/data-access-plushie/project.json ---
{
  "name": "reviews-data-access-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/reviews/data-access-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:data-access", "context:reviews"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/reviews/data-access-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/data-access-plushie/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/data-access-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/domain/jest.config.ts ---
export default {
  displayName: 'reviews-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/reviews/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/reviews/domain/package.json ---
{
    "name": "@royal-code/features/reviews/domain",
    "version": "0.0.1",
    "sideEffects": false,
    "type": "module",
    "license": "MIT"
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/domain/project.json ---
{
  "name": "reviews-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/reviews/domain/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:domain", "scope:features-reviews"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/features/reviews/domain/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/features/reviews/domain/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/features/reviews/domain/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/reviews/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/domain/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/ui-challenger/jest.config.ts ---
export default {
  displayName: 'reviews-ui-challenger',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/reviews/ui-challenger',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/reviews/ui-challenger/project.json ---
{
  "name": "reviews-ui-challenger",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/reviews/ui-challenger/src",
  "prefix": "challenger",
  "projectType": "library",
  "tags": ["scope:challenger", "type:feature", "context:reviews"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/reviews/ui-challenger/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/ui-challenger/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/ui-challenger/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/ui-plushie/jest.config.ts ---
export default {
  displayName: 'reviews-ui-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/reviews/ui-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/reviews/ui-plushie/project.json ---
{
  "name": "reviews-ui-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/reviews/ui-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:feature", "context:reviews"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/reviews/ui-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/ui-plushie/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/reviews/ui-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/rewards/jest.config.ts ---
export default {
  displayName: 'rewards',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/rewards',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/rewards/project.json ---
{
  "name": "rewards",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/rewards/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/rewards/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/rewards/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/rewards/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/shared/node-challenge/package.json ---
{
  "name": "@royal-code/features/shared/node-challenge",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@royal-code/shared/domain": "workspace:*",
    "@royal-code/ui/overlay": "workspace:*"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false,
  "type": "module"
}
--- END OF FILE ---

--- START OF FILE libs/features/shared/node-challenge/project.json ---
{
  "name": "shared-node-challenge",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/shared/node-challenge/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-shared", "context:node-challenge"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/shared/node-challenge/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/shared/node-challenge/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2022",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/shared/node-challenge/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2015",
    "types": ["jest", "node"]
  },
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/shop/jest.config.ts ---
export default {
  displayName: 'shop',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/shop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/shop/project.json ---
{
  "name": "shop",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/shop/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature", "domain:economy"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/shop/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/shop/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/shop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/core/jest.config.ts ---
export default {
  displayName: 'social-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/social/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/social/core/project.json ---
{
  "name": "social-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/social/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:social"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/social/core/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/social/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/data-access/jest.config.ts ---
export default {
  displayName: 'social-data-access',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/social/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/social/data-access/project.json ---
{
  "name": "social-data-access",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/social/data-access/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:data-access", "context:social"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/social/data-access/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/social/data-access/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/domain/jest.config.ts ---
export default {
  displayName: 'social-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/social/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/social/domain/package.json ---
{
    "name": "@royal-code/features/social/domain",
    "version": "0.0.1",
    "sideEffects": false,
    "type": "module",
    "license": "MIT",
    "peerDependencies": {
      "@royal-code/shared/domain": "workspace:*",
      "@royal-code/shared/base-models": "workspace:*"
    }
}
--- END OF FILE ---

--- START OF FILE libs/features/social/domain/project.json ---
{
  "name": "features-social-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/social/domain/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["scope:social", "type:domain"],
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/features/social/domain",
        "main": "libs/features/social/domain/src/index.ts",
        "tsConfig": "libs/features/social/domain/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "declaration": true,
          "declarationMap": true
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/social/domain/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/social/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/social/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/ui-plushie/jest.config.ts ---
export default {
  displayName: 'social-ui-plushie',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/social/ui-plushie',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/social/ui-plushie/project.json ---
{
  "name": "social-ui-plushie",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/social/ui-plushie/src",
  "prefix": "plushie",
  "projectType": "library",
  "tags": ["scope:plushie-paradise", "type:feature", "context:social"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/social/ui-plushie/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/social/ui-plushie/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/ui-plushie/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/ui/jest.config.ts ---
export default {
  displayName: 'social-ui',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/social/ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/social/ui/project.json ---
{
  "name": "social-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/social/ui/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:social"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/social/ui/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/social/ui/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/social/ui/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/stats/jest.config.ts ---
export default {
  displayName: 'stats',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/stats',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/stats/project.json ---
{
  "name": "stats",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/stats/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/stats/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/stats/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/stats/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/test/jest.config.ts ---
export default {
  displayName: 'test',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/test',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/test/json-output-viewer/jest.config.ts ---
export default {
  displayName: 'json-output-viewer-feature',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/test/json-output-viewer',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/test/json-output-viewer/project.json ---
{
  "name": "json-output-viewer-feature",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/test/json-output-viewer/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:feature-test", "context:test"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/test/json-output-viewer/jest.config.ts",
        "tsConfig": "libs/features/test/json-output-viewer/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/test/json-output-viewer/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/test/json-output-viewer/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/test/project.json ---
{
  "name": "test",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/test/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/test/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/test/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/test/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/themes/jest.config.ts ---
export default {
  displayName: 'themes',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/themes',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/themes/project.json ---
{
  "name": "themes",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/themes/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/themes/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/themes/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/themes/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
, "../../store/theme/src/lib/services/theme.service.spec.ts"  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/tracking/jest.config.ts ---
export default {
  displayName: 'tracking',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/tracking',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/tracking/project.json ---
{
  "name": "tracking",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/tracking/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:feature", "type:feature"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/tracking/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/tracking/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/tracking/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/users/jest.config.ts ---
export default {
  displayName: 'users',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/features/users',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/users/project.json ---
{
  "name": "users",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/users/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/users/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/users/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/users/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/core/jest.config.ts ---
export default {
  displayName: 'wishlist-core',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/wishlist/core',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/core/project.json ---
{
  "name": "wishlist-core",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/wishlist/core/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:feature-core", "context:wishlist"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/wishlist/core/jest.config.ts",
        "tsConfig": "libs/features/wishlist/core/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/core/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/core/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/data-access-droneshop/jest.config.ts ---
export default {
  displayName: 'wishlist-data-access-droneshop',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory:
    '../../../../coverage/libs/features/wishlist/data-access-droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/data-access-droneshop/project.json ---
{
  "name": "wishlist-data-access-droneshop",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/wishlist/data-access-droneshop/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:data-access", "context:wishlist"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/wishlist/data-access-droneshop/jest.config.ts",
        "tsConfig": "libs/features/wishlist/data-access-droneshop/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/data-access-droneshop/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/data-access-droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/domain/jest.config.ts ---
export default {
  displayName: 'wishlist-domain',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/wishlist/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/domain/project.json ---
{
  "name": "wishlist-domain",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/wishlist/domain/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:domain", "context:wishlist"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/wishlist/domain/jest.config.ts",
        "tsConfig": "libs/features/wishlist/domain/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/domain/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/ui-droneshop/jest.config.ts ---
export default {
  displayName: 'wishlist-ui-droneshop',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/features/wishlist/ui-droneshop',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/ui-droneshop/project.json ---
{
  "name": "wishlist-ui-droneshop",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/features/wishlist/ui-droneshop/src",
  "prefix": "droneshop",
  "projectType": "library",
  "tags": ["scope:droneshop", "type:feature", "context:wishlist"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/features/wishlist/ui-droneshop/jest.config.ts",
        "tsConfig": "libs/features/wishlist/ui-droneshop/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/ui-droneshop/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/features/wishlist/ui-droneshop/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/mappers/jest.config.ts ---
export default {
  displayName: 'mappers',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/mappers',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/mappers/project.json ---
{
  "name": "mappers",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/mappers/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/mappers/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/mappers/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/mappers/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/mocks/jest.config.ts ---
export default {
  displayName: 'mocks',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/mocks',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/mocks/project.json ---
{
  "name": "mocks",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/mocks/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/mocks/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/mocks/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/mocks/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/assets/project.json ---
{
    "name":  "assets",
    "$schema":  "../../../node_modules/nx/schemas/project-schema.json",
    "sourceRoot":  "libs/shared/assets/src",
    "projectType":  "library",
    "tags":  [

             ],
    "// targets":  "to see all targets run: nx show project assets --web",
    "targets":  {

                }
}
--- END OF FILE ---

--- START OF FILE libs/shared/assets/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "importHelpers": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/base-models/jest.config.ts ---
export default {
  displayName: 'shared/base-models',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/shared/base-models',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/shared/base-models/package.json ---
{
    "name": "@royal-code/shared/base-models",
    "version": "0.0.1",
    "sideEffects": false,
    "type": "module",
    "main": "src/index.js",
    "module": "src/index.js", 
    "types": "src/index.d.ts",
    "license": "MIT"
}
--- END OF FILE ---

--- START OF FILE libs/shared/base-models/project.json ---
{
  "name": "shared/base-models",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/base-models/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:domain", "scope:shared", "context:base"],
   "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/shared/base-models", 
        "main": "libs/shared/base-models/src/index.ts",
        "tsConfig": "libs/shared/base-models/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "declaration": true,
          "declarationMap": true
        },
        "development": {}
      },
      "defaultConfiguration": "production" 
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/base-models/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve",
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/base-models/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/domain/jest.config.ts ---
export default {
  displayName: 'domain',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/shared/domain',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/shared/domain/package.json ---
{
    "name": "@royal-code/shared/domain",
    "version": "0.0.1",
    "sideEffects": false,
    "type": "module",
    "license": "MIT"
}
--- END OF FILE ---

--- START OF FILE libs/shared/domain/project.json ---
{
  "name": "shared/domain",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/domain/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:domain", "scope:shared"],
  "implicitDependencies": ["shared/base-models"],
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/shared/domain",
        "main": "libs/shared/domain/src/index.ts",
        "tsConfig": "libs/shared/domain/tsconfig.lib.json",
        "assets": []
      },
      "configurations": {
        "production": {
          "declaration": true,
          "declarationMap": true
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/domain/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/domain/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/initializers/project.json ---
{
  "name": "shared/initializers",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/initializers/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:util", "scope:shared"],
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/shared/initializers",
        "main": "libs/shared/initializers/src/index.ts",
        "tsConfig": "libs/shared/initializers/tsconfig.lib.json",
        "assets": []
      },
      "configurations": {
        "production": {
          "declaration": true,
          "declarationMap": true
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["libs/shared/initializers/**/*.ts"]
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/styles/jest.config.ts ---
export default {
  displayName: 'shared-styles',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/shared/styles',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/shared/styles/project.json ---
{
  "name": "shared-styles",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/styles/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["scope:shared", "type:util", "context:styling"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/shared/styles/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/styles/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/styles/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/ui/gestures/jest.config.ts ---
export default {
  displayName: 'gestures',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/shared/ui/gestures',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/shared/ui/gestures/project.json ---
{
  "name": "gestures",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/ui/gestures/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:util", "context:gestures"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/shared/ui/gestures/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/ui/gestures/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/ui/gestures/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/ui/layout/jest.config.ts ---
export default {
  displayName: 'shared-ui-layout',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/shared/ui/layout',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/shared/ui/layout/project.json ---
{
  "name": "shared-ui-layout",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/ui/layout/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/shared/ui/layout/jest.config.ts",
        "tsConfig": "libs/shared/ui/layout/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/ui/layout/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/ui/layout/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/shared/utils/jest.config.ts ---
export default {
  displayName: 'utils',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/shared/utils',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/shared/utils/package.json ---
{
  "name": "@royal-code/shared/utils",
  "version": "0.0.1",
  "sideEffects": false,
  "type": "module",
  "license": "MIT",
  "peerDependencies": {
    
    
    "@angular/platform-browser": "*",
    "@angular/router": "*",
    "@ngx-translate/core": "*",
    "@royal-code/shared/domain": "workspace:*"
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/utils/project.json ---
{
  "name": "utils",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/utils/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:util", "scope:shared"],
  "implicitDependencies": ["domain"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/shared/utils/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/shared/utils/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/shared/utils/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/shared/utils/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/utils/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/shared/utils/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/store/auth/jest.config.ts ---
export default {
  displayName: 'auth',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/store/auth',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/store/auth/package.json ---
{
  "name": "@royal-code/store/auth",
  "version": "0.0.1",
  "sideEffects": false,
  "main": "index.js",
  "module": "index.js",
  "types": "index.d.ts",
  "peerDependencies": {
    
    "@ngrx/store": "*"
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/auth/project.json ---
{
  "name": "auth",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/store/auth/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:store-feature", "scope:auth"],
  "implicitDependencies": [
    "core-logging",
    "storage",  
    "ui-notifications",
    "auth-data-access"
  ],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/store/auth/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/auth/tsconfig.json ---
{
"compilerOptions": {
"target": "es2023",
"forceConsistentCasingInFileNames": true,
"strict": true,
"noImplicitOverride": true,
"noPropertyAccessFromIndexSignature": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true
},
"files": [],
"include": [],
"extends": "../../../tsconfig.base.json",
"angularCompilerOptions": {
"enableI18nLegacyMessageIdFormat": false,
"strictInjectionParameters": true,
"strictInputAccessModifiers": true,
"typeCheckHostBindings": true,
"strictTemplates": true
}
}
--- END OF FILE ---

--- START OF FILE libs/store/auth/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/store/error/jest.config.ts ---
export default {
  displayName: 'error',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/store/error',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/store/error/package.json ---
{
  "name": "@royal-code/store/error",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@ngrx/store": "*",
    "@ngrx/effects": "*",
    "@royal-code/shared/domain": "workspace:*",
    "@royal-code/ui/notifications": "workspace:*"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false,
  "type": "module"
}
--- END OF FILE ---

--- START OF FILE libs/store/error/project.json ---
{
  "name": "error",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/store/error/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:store-feature", "scope:error"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/store/error/ng-package.json",
        "tsConfig": "libs/store/error/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/store/error/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/store/error/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/error/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/error/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/store/jest.config.ts ---
export default {
  displayName: 'store',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/store',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/store/notifications/jest.config.ts ---
export default {
  displayName: 'store-notifications',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/store/notifications',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/store/notifications/project.json ---
{
  "name": "store-notifications",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/store/notifications/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["scope:store", "type:state"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/store/notifications/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/notifications/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/notifications/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/store/project.json ---
{
  "name": "store",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/store/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/store/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/session/package.json ---
{
  "name": "@royal-code/store/session",
  "version": "0.0.1",
  "peerDependencies": {
    "@ngrx/store": "^20.0.0"
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/session/project.json ---
{
  "name": "session",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/store/session/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/libs/store/session"],
      "options": {
        "project": "libs/store/session/ng-package.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["libs/store/session/**/*.ts"]
      }
    }
  },
  "tags": ["scope:store", "type:feature"]
}
--- END OF FILE ---

--- START OF FILE libs/store/session/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "module": "es2022",
    "moduleResolution": "node",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/store/theme/jest.config.ts ---
export default {
  displayName: 'theme',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/store/theme',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/store/theme/package.json ---
{
  "name": "@royal-code/store/theme",
  "version": "0.0.1",
  "sideEffects": false,
  "main": "index.js",
  "module": "index.js",
  "types": "index.d.ts",
  "peerDependencies": {
    
    "@ngrx/store": "*"
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/theme/project.json ---
{
  "name": "theme",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/store/theme/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:store-feature", "scope:theme"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/store/theme/ng-package.json",
        "tsConfig": "libs/store/theme/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/store/theme/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/store/theme/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/theme/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/theme/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/store/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/store/user/jest.config.ts ---
export default {
  displayName: 'User',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/store/user',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/store/user/package.json ---
{
    "name": "@royal-code/store/user",
    "version": "0.0.1",
    "peerDependencies": {
        
        
        "@ngrx/store": "*",
        "@ngrx/effects": "*",
        "@ngrx/entity": "*",
        "@royal-code/shared/domain": "workspace:*",
        "@royal-code/features/account/core": "workspace:*",
        "@royal-code/ui/notifications": "workspace:*",
        "@royal-code/store/auth": "workspace:*",          
        "@royal-code/core/core-logging": "workspace:*",        
        "@royal-code/features/social/domain": "workspace:*" 
    },
    "dependencies": {
        "tslib": "^2.3.0"
    },
    "sideEffects": false,
    "type": "module"
}
--- END OF FILE ---

--- START OF FILE libs/store/user/project.json ---
{
  "name": "user",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/store/user/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:store-feature", "scope:user"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/store/user/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/user/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node"
  },
  "files": [],
  "include": [],
  "extends": "../../../tsconfig.base.json",
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/store/user/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/accordion/project.json ---
{
  "name": "ui-accordion",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "projectType": "library",
  "sourceRoot": "libs/ui/accordion/src",
  "prefix": "lib",
  "tags": ["ui"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/libs/ui/accordion"],
      "options": {
        "jestConfig": "libs/ui/accordion/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "options": {
        "lintFilePatterns": [
          "libs/ui/accordion/**/*.ts",
          "libs/ui/accordion/**/*.html"
        ]
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/accordion/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "exclude": ["jest.config.ts", "**/*.test.ts", "**/*.spec.ts"],
  "include": ["**/*.ts"]
}
--- END OF FILE ---

--- START OF FILE libs/ui/avatar-renderer/jest.config.ts ---
export default {
  displayName: 'avatar-renderer',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/avatar-renderer',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/avatar-renderer/package.json ---
{
    "name":  "@royal-code/ui/avatar-renderer",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/avatar-renderer/project.json ---
{
  "name": "avatar-renderer",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/avatar-renderer/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "release": {
    "version": {
      "manifestRootsToUpdate": ["dist/{projectRoot}"],
      "currentVersionResolver": "git-tag",
      "fallbackCurrentVersionResolver": "disk"
    }
  },
  "tags": ["scope:ui", "type:ui-avatar-renderer"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/avatar-renderer/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/avatar-renderer/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/avatar-renderer/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "nx-release-publish": {
      "options": {
        "packageRoot": "dist/{projectRoot}"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/avatar-renderer/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/avatar-renderer/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/avatar-renderer/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/backgrounds/jest.config.ts ---
export default {
  displayName: 'backgrounds',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/backgrounds',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/backgrounds/project.json ---
{
  "name": "backgrounds",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/backgrounds/src",
  "prefix": "royal",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui", "context:visuals"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/backgrounds/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/backgrounds/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/backgrounds/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/badge/jest.config.ts ---
export default {
  displayName: 'badge',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/badge',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/badge/project.json ---
{
  "name": "badge",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/badge/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui", "context:display"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/badge/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/badge/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/badge/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/breadcrumb/jest.config.ts ---
export default {
  displayName: 'breadcrumb',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/breadcrumb',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/breadcrumb/package.json ---
{
    "name":  "@royal-code/ui/breadcrumb",
    "version":  "0.0.1",
    "sideEffects":  false,
    "peerDependencies": {
      
      
      "@angular/router": "*",
      "@ngx-translate/core": "*",
      "@royal-code/shared/domain": "workspace:*",
      "@royal-code/ui/button": "workspace:*",
      "@royal-code/ui/icon": "workspace:*",
      "@royal-code/ui/paragraph": "workspace:*"
    }
}
--- END OF FILE ---

--- START OF FILE libs/ui/breadcrumb/project.json ---
{
  "name": "breadcrumb",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/breadcrumb/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui"],
  "implicitDependencies": ["button", "icon", "paragraph"],
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/breadcrumb/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/breadcrumb/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/button/jest.config.ts ---
export default {
  displayName: 'button',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/button',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/button/package.json ---
{
    "name":  "@royal-code/ui/button",
    "version":  "0.0.1",
    "sideEffects":  false,
    "type":  "module",
    "license":  "MIT",
    "peerDependencies": {
      
      
      "@royal-code/shared/domain": "workspace:*",
      "@royal-code/ui/icon": "workspace:*"
    }
}
--- END OF FILE ---

--- START OF FILE libs/ui/button/project.json ---
{
  "name": "button",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/button/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "implicitDependencies": ["icon"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/button/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/button/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/button/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/button/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/button/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/button/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/card/package.json ---
{
  "name": "@royal-code/ui/cards/card",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@royal-code/ui/title": "workspace:*"
  },
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/card/project.json ---
{
  "name": "card-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/card/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:card"],
  "implicitDependencies": ["title"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/cards/card/ng-package.json",
        "tsConfig": "libs/ui/cards/card/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/cards/card/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/card/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/feature-card/package.json ---
{
  "name": "@royal-code/ui/cards/feature-card",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/feature-card/project.json ---
{
  "name": "feature-card-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/feature-card/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:card"],
  "implicitDependencies": ["icon", "title", "paragraph"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/cards/feature-card/ng-package.json",
        "tsConfig": "libs/ui/cards/feature-card/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/cards/feature-card/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/feature-card/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/full-width-image-card/package.json ---
{
  "name": "@royal-code/ui/cards/full-width-image-card",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@royal-code/ui/button": "workspace:*",
    "@royal-code/ui/media": "workspace:*"
  },
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/full-width-image-card/project.json ---
{
  "name": "full-width-image-card-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/full-width-image-card/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:card"],
  "implicitDependencies": ["button", "media-ui", "icon"],
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/full-width-image-card/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/icon-text-row/package.json ---
{
  "name": "@royal-code/ui/cards/icon-text-row",
  "version": "0.0.1",
  "sideEffects": false,
  "peerDependencies": {
    "@royal-code/ui/icon": "workspace:*",
    "@royal-code/ui/paragraph": "workspace:*",
    "@royal-code/shared/domain": "workspace:*"
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/icon-text-row/project.json ---
{
  "name": "icon-text-row-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/icon-text-row/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:utility"],
  "implicitDependencies": ["icon", "paragraph"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/cards/icon-text-row/ng-package.json",
        "tsConfig": "libs/ui/cards/icon-text-row/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/cards/icon-text-row/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/icon-text-row/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/item-carousel/package.json ---
{
  "name": "@royal-code/ui/cards/item-carousel",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/item-carousel/project.json ---
{
  "name": "item-carousel-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/item-carousel/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:carousel"],
  "implicitDependencies": ["title", "media-ui", "paragraph"],
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/item-carousel/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/product-accessory-card/package.json ---
{
  "name": "@royal-code/ui/cards/product-accessory-card",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/product-accessory-card/project.json ---
{
  "name": "product-accessory-card-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/product-accessory-card/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:product"],
  "implicitDependencies": ["media-ui", "title"],
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/product-accessory-card/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/profile-avatar-card/package.json ---
{
  "name": "@royal-code/ui/cards/profile-avatar-card",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/profile-avatar-card/project.json ---
{
  "name": "profile-avatar-card-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/profile-avatar-card/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:profile"],
  "implicitDependencies": ["media-ui", "title", "paragraph"],
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/profile-avatar-card/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/settings-card/package.json ---
{
  "name": "@royal-code/ui/cards/settings-card",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/settings-card/project.json ---
{
  "name": "settings-card-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/settings-card/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:settings"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/cards/settings-card/ng-package.json",
        "tsConfig": "libs/ui/cards/settings-card/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/cards/settings-card/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/settings-card/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/stat-card/package.json ---
{
  "name": "@royal-code/ui/cards/stat-card",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/stat-card/project.json ---
{
  "name": "stat-card-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/stat-card/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:card"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/cards/stat-card/ng-package.json",
        "tsConfig": "libs/ui/cards/stat-card/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/cards/stat-card/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/stat-card/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/story-card/package.json ---
{
  "name": "@royal-code/ui/cards/story-card",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/story-card/project.json ---
{
  "name": "story-card-ui",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/cards/story-card/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:story"],
  "implicitDependencies": ["media-ui", "title", "paragraph", "button", "icon"],
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/cards/story-card/tsconfig.json ---
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/code-block/jest.config.ts ---
export default {
  displayName: 'code-block',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/code-block',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/code-block/project.json ---
{
  "name": "code-block",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/code-block/src",
  "prefix": "royal",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/code-block/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/code-block/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/code-block/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/dataflow-diagram/jest.config.ts ---
export default {
  displayName: 'dataflow-diagram',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/dataflow-diagram',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/dataflow-diagram/project.json ---
{
  "name": "dataflow-diagram",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/dataflow-diagram/src",
  "prefix": "royal",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui", "context:diagrams"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/dataflow-diagram/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/dataflow-diagram/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/dataflow-diagram/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/dialogs/jest.config.ts ---
export default {
  displayName: 'dialogs',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/dialogs',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/dialogs/package.json ---
{
    "name":  "@royal-code/ui/dialogs",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/dialogs/project.json ---
{
  "name": "dialogs",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/dialogs/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/dialogs/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/dialogs/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/dialogs/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/dialogs/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/dialogs/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/dialogs/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/dropdown/jest.config.ts ---
export default {
  displayName: 'dropdown-ui',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/dropdown',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/dropdown/package.json ---
{
    "name":  "@royal-code/ui/dropdown",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/dropdown/project.json ---
{
  "name": "dropdown-ui",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/dropdown/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/dropdown/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/dropdown/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/dropdown/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/dropdown/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/dropdown/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/dropdown/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/faq/jest.config.ts ---
export default {
  displayName: 'faq',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/faq',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/faq/package.json ---
{
    "name":  "@royal-code/ui/faq",
    "version":  "0.0.1",
    "sideEffects":  false,
    "peerDependencies": {
      "@royal-code/ui/icon": "workspace:*",
      "@royal-code/ui/paragraph": "workspace:*",
      "@royal-code/shared/domain": "workspace:*"
    }
}
--- END OF FILE ---

--- START OF FILE libs/ui/faq/project.json ---
{
  "name": "faq",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/faq/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui"],
  "implicitDependencies": ["icon", "paragraph"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/faq/ng-package.json",
        "tsConfig": "libs/ui/faq/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/faq/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/faq/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/faq/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/filters/jest.config.ts ---
export default {
  displayName: 'filters',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/filters',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/filters/package.json ---
{
    "name":  "@royal-code/ui/filters",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/filters/project.json ---
{
  "name": "filters",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/filters/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/filters/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/filters/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/filters/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/filters/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/filters/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/filters/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/folder-tree/jest.config.ts ---
export default {
  displayName: 'folder-tree',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/folder-tree',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/folder-tree/project.json ---
{
  "name": "folder-tree",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/folder-tree/src",
  "prefix": "royal",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui", "context:visual"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/folder-tree/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/folder-tree/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/folder-tree/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/forms/jest.config.ts ---
export default {
  displayName: 'ui-forms',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/forms',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/forms/project.json ---
{
  "name": "ui-forms",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/forms/src",
  "prefix": "royal-code",
  "tags": ["type:ui", "scope:shared"],
  "projectType": "library",
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/forms/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/forms/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve",
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/forms/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/generic-overview/jest.config.ts ---
export default {
  displayName: 'generic-overview',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/generic-overview',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/generic-overview/package.json ---
{
    "name":  "@royal-code/ui/generic-overview",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/generic-overview/project.json ---
{
  "name": "generic-overview",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/generic-overview/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/generic-overview/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/generic-overview/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/generic-overview/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/generic-overview/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/generic-overview/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/generic-overview/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/grid/jest.config.ts ---
export default {
  displayName: 'grid',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/grid',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/grid/package.json ---
{
    "name":  "@royal-code/ui/grid",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/grid/project.json ---
{
  "name": "grid",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/grid/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/grid/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/grid/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/grid/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/grid/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/grid/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/grid/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/icon/jest.config.ts ---
export default {
  displayName: 'icon',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/icon',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/icon/package.json ---
{
    "name": "@royal-code/ui/icon",
    "version": "0.0.1",
    "sideEffects": false,
    "type": "module",
    "license": "MIT"
}
--- END OF FILE ---

--- START OF FILE libs/ui/icon/project.json ---
{
  "name": "icon",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/icon/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/icon/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/icon/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/icon/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/icon/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/icon/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/icon/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/input/jest.config.ts ---
export default {
  displayName: 'input',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/input',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/input/package.json ---
{
    "name":  "@royal-code/ui/input",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/input/project.json ---
{
  "name": "input",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/input/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui"],
  "implicitDependencies": ["icon", "button"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/input/ng-package.json",
        "tsConfig": "libs/ui/input/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/input/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/input/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/input/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/language-selector/jest.config.ts ---
export default {
  displayName: 'language-selector',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/language-selector',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/language-selector/project.json ---
{
  "name": "language-selector",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/language-selector/src",
  "prefix": "royal",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui", "context:i18n"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/language-selector/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/language-selector/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/language-selector/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/list/jest.config.ts ---
export default {
  displayName: 'list',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/list',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/list/package.json ---
{
    "name":  "@royal-code/ui/list",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/list/project.json ---
{
  "name": "list",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/list/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/list/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/list/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/list/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/list/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/list/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/list/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/media/jest.config.ts ---
export default {
  displayName: 'media-ui',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/media',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/media/package.json ---
{
    "name":  "@royal-code/ui/media",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/media/project.json ---
{
  "name": "media-ui",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/media/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/media/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/media/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/media/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/menu/jest.config.ts ---
export default {
  displayName: 'menu',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/menu',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/menu/package.json ---
{
    "name":  "@royal-code/ui/menu",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/menu/project.json ---
{
  "name": "menu",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/menu/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/menu/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/menu/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/menu/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/menu/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/menu/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/menu/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/meters/jest.config.ts ---
export default {
  displayName: 'meters',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/meters',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/meters/package.json ---
{
    "name":  "@royal-code/ui/meters",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/meters/project.json ---
{
  "name": "meters",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/meters/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "release": {
    "version": {
      "manifestRootsToUpdate": ["dist/{projectRoot}"],
      "currentVersionResolver": "git-tag",
      "fallbackCurrentVersionResolver": "disk"
    }
  },
  "tags": ["scope:ui", "type:ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/meters/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/meters/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/meters/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "nx-release-publish": {
      "options": {
        "packageRoot": "dist/{projectRoot}"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/meters/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/meters/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/meters/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/jest.config.ts ---
export default {
  displayName: 'navigation',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/navigation',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/package.json ---
{
    "name":  "@royal-code/ui/navigation",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/project.json ---
{
  "name": "navigation",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/navigation/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/navigation/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/navigation/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/notifications/jest.config.ts ---
export default {
  displayName: 'notifications-ui',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/notifications',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/notifications/package.json ---
{
    "name":  "@royal-code/ui/notifications",
    "version":  "0.0.1",
    "sideEffects":  false,
    "peerDependencies": {
      
      
      "@ngx-translate/core": "*",
      "@royal-code/shared/domain": "workspace:*",
      "@royal-code/ui/button": "workspace:*",
      "@royal-code/ui/overlay": "workspace:*"
    }
}
--- END OF FILE ---

--- START OF FILE libs/ui/notifications/project.json ---
{
  "name": "ui-notifications",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/notifications/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:notifications"],
  "implicitDependencies": [
    "overlay-ui",
    "button"
  ],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/notifications/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/notifications/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/notifications/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/notifications/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/notifications/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node"
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/notifications/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/overlay/jest.config.ts ---
export default {
  displayName: 'overlay-ui',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/overlay',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/overlay/package.json ---
{
    "name":  "@royal-code/ui/overlay",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/overlay/project.json ---
{
  "name": "overlay-ui",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/overlay/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui-infra"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/overlay/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/overlay/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/overlay/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/overlay/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/overlay/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node"
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/overlay/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/pagination/jest.config.ts ---
export default {
  displayName: 'pagination',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/pagination',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/pagination/package.json ---
{
    "name":  "@royal-code/ui/pagination",
    "version":  "0.0.1",
    "sideEffects":  false,
    "peerDependencies": {
        
        
        "@angular/forms": "*",
        "@ngx-translate/core": "*",
        "@royal-code/shared/domain": "workspace:*",
        "@royal-code/ui/button": "workspace:*",
        "@royal-code/ui/icon": "workspace:*"
    }
}
--- END OF FILE ---

--- START OF FILE libs/ui/pagination/project.json ---
{
  "name": "pagination",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/pagination/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui"],
  "implicitDependencies": ["button", "icon", "ui-forms"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/pagination/ng-package.json",
        "tsConfig": "libs/ui/pagination/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/pagination/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/pagination/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/pagination/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/paragraph/jest.config.ts ---
export default {
  displayName: 'paragraph',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/paragraph',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/paragraph/package.json ---
{
    "name":  "@royal-code/ui/paragraph",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/paragraph/project.json ---
{
  "name": "paragraph",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/paragraph/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/paragraph/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/paragraph/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/paragraph/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/paragraph/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/paragraph/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/paragraph/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/products/jest.config.ts ---
export default {
  displayName: 'ui-products',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/products',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/products/project.json ---
{
  "name": "ui-products",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/products/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:products"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/products/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/products/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/products/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/progress/jest.config.ts ---
export default {
  displayName: 'progress',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/progress',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/progress/package.json ---
{
    "name":  "@royal-code/ui/progress",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/progress/project.json ---
{
  "name": "progress",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/progress/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/progress/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/progress/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/progress/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/progress/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/progress/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/progress/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/quantity-input/jest.config.ts ---
export default {
  displayName: 'quantity-input',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/quantity-input',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/quantity-input/package.json ---
{
  "name": "@royal-code/ui/quantity-input",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@royal-code/ui/button": "workspace:*",
    "@royal-code/ui/icon": "workspace:*"
  },
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/quantity-input/project.json ---
{
  "name": "quantity-input",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/quantity-input/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui", "context:forms"],
  "implicitDependencies": ["button", "icon"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/quantity-input/ng-package.json",
        "tsConfig": "libs/ui/quantity-input/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/quantity-input/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/quantity-input/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/quantity-input/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/rating/jest.config.ts ---
export default {
  displayName: 'rating',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/rating',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/rating/package.json ---
{
    "name":  "@royal-code/ui/rating",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/rating/project.json ---
{
  "name": "rating",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/rating/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/rating/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/rating/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/rating/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/rating/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/rating/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/rating/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/review-card/jest.config.ts ---
export default {
  displayName: 'review-card',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/review-card',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/review-card/package.json ---
{
  "name": "@royal-code/ui/review-card",
  "version": "0.0.1",
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/review-card/project.json ---
{
  "name": "review-card",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/review-card/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "release": {
    "version": {
      "manifestRootsToUpdate": ["dist/{projectRoot}"],
      "currentVersionResolver": "git-tag",
      "fallbackCurrentVersionResolver": "disk"
    }
  },
  "tags": ["scope:shared-ui", "type:ui", "context:reviews"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/review-card/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/review-card/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/review-card/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "nx-release-publish": {
      "options": {
        "packageRoot": "dist/{projectRoot}"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/review-card/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/review-card/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/review-card/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/sidebar/jest.config.ts ---
export default {
  displayName: 'ui-sidebar',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/sidebar',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/sidebar/project.json ---
{
  "name": "ui-sidebar",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/sidebar/src",
  "prefix": "royal",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:navigation"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/sidebar/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/sidebar/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/sidebar/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/spinner/jest.config.ts ---
export default {
  displayName: 'spinner',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/spinner',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/spinner/package.json ---
{
    "name":  "@royal-code/ui/spinner",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/spinner/project.json ---
{
  "name": "spinner",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/spinner/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "release": {
    "version": {
      "manifestRootsToUpdate": ["dist/{projectRoot}"],
      "currentVersionResolver": "git-tag",
      "fallbackCurrentVersionResolver": "disk"
    }
  },
  "tags": ["scope:shared-ui", "type:ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/spinner/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/spinner/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/spinner/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "nx-release-publish": {
      "options": {
        "packageRoot": "dist/{projectRoot}"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/spinner/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/spinner/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    },
    {
      "path": "../icon" 
    }
  ],
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/spinner/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/sticky-cta-bar/jest.config.ts ---
export default {
  displayName: 'sticky-cta-bar',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/sticky-cta-bar',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/sticky-cta-bar/package.json ---
{
  "name": "@royal-code/ui/sticky-cta-bar",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^20.3.0",
    "@angular/core": "^20.3.0"
  },
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/sticky-cta-bar/project.json ---
{
  "name": "sticky-cta-bar",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/sticky-cta-bar/src",
  "prefix": "lib",
  "projectType": "library",
  "release": {
    "version": {
      "manifestRootsToUpdate": ["dist/{projectRoot}"],
      "currentVersionResolver": "git-tag",
      "fallbackCurrentVersionResolver": "disk"
    }
  },
  "tags": [],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/sticky-cta-bar/ng-package.json",
        "tsConfig": "libs/ui/sticky-cta-bar/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/sticky-cta-bar/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "nx-release-publish": {
      "options": {
        "packageRoot": "dist/{projectRoot}"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/sticky-cta-bar/jest.config.ts",
        "tsConfig": "libs/ui/sticky-cta-bar/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/sticky-cta-bar/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/sticky-cta-bar/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node10"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/swipe-up-menu/jest.config.ts ---
export default {
  displayName: 'swipe-up-menu',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/swipe-up-menu',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/swipe-up-menu/package.json ---
{
    "name":  "@royal-code/ui/swipe-up-menu",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/swipe-up-menu/project.json ---
{
  "name": "swipe-up-menu",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/swipe-up-menu/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/swipe-up-menu/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/swipe-up-menu/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/swipe-up-menu/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/swipe-up-menu/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/swipe-up-menu/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/swipe-up-menu/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/tabs/jest.config.ts ---
export default {
  displayName: 'tabs',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/tabs',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/tabs/package.json ---
{
    "name":  "@royal-code/ui/tabs",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/tabs/project.json ---
{
  "name": "tabs",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/tabs/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "release": {
    "version": {
      "manifestRootsToUpdate": ["dist/{projectRoot}"],
      "currentVersionResolver": "git-tag",
      "fallbackCurrentVersionResolver": "disk"
    }
  },
  "tags": ["scope:shared-ui", "type:ui", "context:tabs"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/tabs/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/tabs/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/tabs/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "nx-release-publish": {
      "options": {
        "packageRoot": "dist/{projectRoot}"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/tabs/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/tabs/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/tabs/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/team/project.json ---
{
  "name": "team",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/team/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui"],
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/team/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/testimonial/jest.config.ts ---
export default {
  displayName: 'ui-testimonial',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/testimonial',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/testimonial/project.json ---
{
  "name": "ui-testimonial",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/testimonial/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui", "context:display"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/testimonial/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/testimonial/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2023",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/testimonial/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/textarea/jest.config.ts ---
export default {
  displayName: 'textarea',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/textarea',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/textarea/package.json ---
{
    "name":  "@royal-code/ui/textarea",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/textarea/project.json ---
{
  "name": "textarea",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/textarea/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/textarea/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/textarea/tsconfig.lib.prod.json"
        },
        "development": {
          "tsConfig": "libs/ui/textarea/tsconfig.lib.json"
        }
      },
      "defaultConfiguration": "production"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/textarea/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/textarea/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/textarea/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/theme-switcher/jest.config.ts ---
export default {
  displayName: 'theme-switcher',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/theme-switcher',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/theme-switcher/package.json ---
{
    "name":  "@royal-code/ui/theme-switcher",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/ui/theme-switcher/project.json ---
{
  "name": "theme-switcher",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/theme-switcher/src",
  "prefix": "lib",
  "projectType": "library",
  "tags": ["type:ui", "scope:shared-ui"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/theme-switcher/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/theme-switcher/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/theme-switcher/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/title/jest.config.ts ---
export default {
  displayName: 'title',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/title',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/title/package.json ---
{
  "name": "@royal-code/ui/title",
  "version": "0.0.1",
  "peerDependencies": {
    
    
    "@royal-code/shared/domain": "workspace:*",
    "@royal-code/shared/utils": "workspace:*"
  },
  "sideEffects": false
}
--- END OF FILE ---

--- START OF FILE libs/ui/title/project.json ---
{
  "name": "title",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/title/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui"],
  "implicitDependencies": ["icon"],
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "options": {
        "project": "libs/ui/title/ng-package.json",
        "tsConfig": "libs/ui/title/tsconfig.lib.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/ui/title/tsconfig.lib.prod.json"
        },
        "development": {}
      },
      "defaultConfiguration": "production"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/title/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/title/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/variant-selector/jest.config.ts ---
export default {
  displayName: 'variant-selector',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/variant-selector',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/variant-selector/project.json ---
{
  "name": "variant-selector",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/variant-selector/src",
  "prefix": "lib-royal-code",
  "projectType": "library",
  "tags": ["scope:shared-ui", "type:ui", "context:variant-selection"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/variant-selector/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/variant-selector/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/variant-selector/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/wishlist/jest.config.ts ---
export default {
  displayName: 'wishlist-ui',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/ui/wishlist',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/ui/wishlist/project.json ---
{
  "name": "wishlist-ui",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/ui/wishlist/src",
  "prefix": "royal-code",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui", "context:wishlist"],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/ui/wishlist/jest.config.ts",
        "tsConfig": "libs/ui/wishlist/tsconfig.spec.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/ui/wishlist/tsconfig.json ---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE libs/ui/wishlist/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"],
    "moduleResolution": "node"
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE libs/users/data-access/jest.config.ts ---
export default {
  displayName: 'users-data-access',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/users/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
--- END OF FILE ---

--- START OF FILE libs/users/data-access/package.json ---
{
    "name":  "@royal-code/users/data-access",
    "version":  "0.0.1",
    "sideEffects":  false
}
--- END OF FILE ---

--- START OF FILE libs/users/data-access/project.json ---
{
  "name": "users-data-access",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/users/data-access/src",
  "prefix": "users",
  "projectType": "library",
  "tags": [],
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/users/data-access/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
--- END OF FILE ---

--- START OF FILE libs/users/data-access/tsconfig.json ---
{
  "compilerOptions": {
    "target": "es2023",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "extends": "../../../tsconfig.base.json",
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
--- END OF FILE ---

--- START OF FILE libs/users/data-access/tsconfig.spec.json ---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2023",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
--- END OF FILE ---

--- START OF FILE migrations.json ---
{
  "migrations": [
    {
      "version": "21.3.0-beta.3",
      "requires": { "jest": ">=30.0.0" },
      "description": "Rename the CLI option `testPathPattern` to `testPathPatterns`.",
      "implementation": "./src/migrations/update-21-3-0/rename-test-path-pattern",
      "package": "@nx/jest",
      "name": "rename-test-path-pattern"
    }
  ]
}
--- END OF FILE ---

--- START OF FILE nx.json ---
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "master",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/.eslintrc.json",
      "!{projectRoot}/eslint.config.mjs",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/jest.config.[jt]s",
      "!{projectRoot}/src/test-setup.[jt]s",
      "!{projectRoot}/test-setup.[jt]s"
    ],
    "sharedGlobals": []
  },
  "targetDefaults": {
    "@angular-devkit/build-angular:application": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "@nx/eslint:lint": {
      "cache": true,
      "inputs": [
        "default",
        "{workspaceRoot}/.eslintrc.json",
        "{workspaceRoot}/.eslintignore",
        "{workspaceRoot}/eslint.config.mjs"
      ]
    },
    "@nx/jest:jest": {
      "cache": true,
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "options": {
        "passWithNoTests": true
      },
      "configurations": {
        "ci": {
          "ci": true,
          "codeCoverage": true
        }
      }
    },
    "e2e-ci--**/*": {
      "dependsOn": ["^build"]
    },
    "@nx/angular:ng-packagr-lite": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "@nx/angular:package": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "@angular/build:application": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    }
  },
  "plugins": [
    {
      "plugin": "@nx/playwright/plugin",
      "options": {
        "targetName": "e2e"
      }
    },
    {
      "plugin": "@nx/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    }
  ],
  "generators": {
    "@nx/angular:application": {
      "e2eTestRunner": "playwright",
      "linter": "eslint",
      "style": "scss",
      "unitTestRunner": "jest"
    },
    "@nx/angular:library": {
      "linter": "eslint",
      "unitTestRunner": "jest"
    },
    "@nx/angular:component": {
      "style": "css",
      "type": "component"
    },
    "@schematics/angular:component": {
      "type": "component"
    },
    "@nx/angular:directive": {
      "type": "directive"
    },
    "@schematics/angular:directive": {
      "type": "directive"
    },
    "@nx/angular:service": {
      "type": "service"
    },
    "@schematics/angular:service": {
      "type": "service"
    },
    "@nx/angular:scam": {
      "type": "component"
    },
    "@nx/angular:scam-directive": {
      "type": "directive"
    },
    "@nx/angular:guard": {
      "typeSeparator": "."
    },
    "@schematics/angular:guard": {
      "typeSeparator": "."
    },
    "@nx/angular:interceptor": {
      "typeSeparator": "."
    },
    "@schematics/angular:interceptor": {
      "typeSeparator": "."
    },
    "@nx/angular:module": {
      "typeSeparator": "."
    },
    "@schematics/angular:module": {
      "typeSeparator": "."
    },
    "@nx/angular:pipe": {
      "typeSeparator": "."
    },
    "@schematics/angular:pipe": {
      "typeSeparator": "."
    },
    "@nx/angular:resolver": {
      "typeSeparator": "."
    },
    "@schematics/angular:resolver": {
      "typeSeparator": "."
    }
  },
  "release": {
    "version": {
      "preVersionCommand": "npx nx run-many -t build"
    }
  },
  "nxCloudWhenDisconnected": "ignore",
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"]
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE package.json ---
{
  "name": "@royal-code/source",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "postinstall": "node scripts/cleanup-node-modules.js",
    "build:tailwind": "echo 'Tailwind build disabled for deployment'",
    "build:tailwind:watch": "echo 'Tailwind watch disabled'",
    "export-code": "tsc export-ts-angular-to-md.ts",
    "build:droneshop": "nx build droneshop --configuration=production",
    "serve-ssr:droneshop": "node dist/apps/droneshop/server/main.js",
    "start": "nx serve droneshop",
    "build:cv": "ng build cv --configuration=production",
    "build:cv:nx": "npx nx build cv --configuration=production",
    "build:cv:skip-deps": "npx nx build cv --configuration=production --skip-nx-cache",
    "build:cv:standalone": "cd apps/cv && npx ng build --configuration=production --output-path=../../dist/apps/cv",
    "serve:cv": "ng serve cv",
    "nx:projects": "npx nx show projects",
    "debug:cv": "cat apps/cv/project.json",
    "debug:workspace": "cat nx.json"
  },
  "engines": {
    "node": "20.x"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "20.3.0",
    "@angular/cdk": "20.2.2",
    "@angular/common": "20.3.0",
    "@angular/compiler": "20.3.0",
    "@angular/core": "20.3.0",
    "@angular/forms": "20.3.0",
    "@angular/platform-browser": "20.3.0",
    "@angular/platform-browser-dynamic": "20.3.0",
    "@angular/platform-server": "20.3.0",
    "@angular/router": "20.3.0",
    "@angular/ssr": "20.3.0",
    "@angular/youtube-player": "^20.2.2",
    "@auth0/angular-jwt": "^5.2.0",
    "@babylonjs/core": "8.27.0",
    "@babylonjs/gui": "8.27.0",
    "@babylonjs/loaders": "8.27.0",
    "@babylonjs/materials": "8.27.0",
    "@ctrl/ngx-emoji-mart": "^9.2.0",
    "@faker-js/faker": "10.0.0",
    "@ngrx/component-store": "20.0.1",
    "@ngrx/effects": "20.0.1",
    "@ngrx/entity": "20.0.1",
    "@ngrx/router-store": "20.0.1",
    "@ngrx/schematics": "20.0.1",
    "@ngrx/signals": "20.0.1",
    "@ngrx/store": "20.0.1",
    "@ngrx/store-devtools": "20.0.1",
    "@ngx-formly/bootstrap": "7.0.0",
    "@ngx-formly/core": "7.0.0",
    "@ngx-translate/core": "17.0.0",
    "@ngx-translate/http-loader": "17.0.0",
    "@types/leaflet.markercluster": "^1.5.6",
    "@types/uuid": "^10.0.0",
    "angular-in-memory-web-api": "^0.20.0",
    "chart.js": "^4.5.0",
    "express": "^5.1.0",
    "highlight.js": "^11.11.1",
    "jwt-decode": "^4.0.0",
    "leaflet": "^1.9.4",
    "leaflet.markercluster": "^1.5.3",
    "lucide-angular": "0.543.0",
    "luxon": "^3.7.2",
    "ng2-charts": "^8.0.0",
    "ngrx-store-localstorage": "20.0.0",
    "ngx-highlight-js": "^20.0.0",
    "ngx-infinite-scroll": "^20.0.0",
    "ngx-translate-multi-http-loader": "^20.0.0",
    "readable-stream": "^4.5.2",
    "rxjs": "~7.8.2",
    "tailwindcss": "^4.1.13",
    "@tailwindcss/postcss": "^4.1.13",
    "three": "0.180.0",
    "uuid": "^13.0.0",
    "web-vitals": "^5.1.0",
    "zone.js": "~0.15.1"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "20.3.0",
    "@angular-devkit/core": "20.3.0",
    "@angular-devkit/schematics": "20.3.0",
    "@angular/build": "20.3.0",
    "@angular/cli": "20.3.0",
    "@angular/compiler-cli": "20.3.0",
    "@angular/language-service": "20.3.0",
    "@eslint/js": "9.35.0",
    "@nrwl/cli": "15.9.3",
    "@nx/angular": "21.5.1",
    "@nx/devkit": "21.5.1",
    "@nx/eslint": "21.5.1",
    "@nx/eslint-plugin": "21.5.1",
    "@nx/jest": "21.5.1",
    "@nx/js": "21.5.1",
    "@nx/playwright": "21.5.1",
    "@nx/web": "21.5.1",
    "@nx/workspace": "21.5.1",
    "@playwright/test": "1.55.0",
    "@schematics/angular": "20.3.0",
    "@swc-node/register": "1.11.1",
    "@swc/core": "1.13.5",
    "@swc/helpers": "0.5.17",
    "@types/chart.js": "^4.0.1",
    "@types/express": "^4.17.21",
    "@types/jest": "30.0.0",
    "@types/leaflet": "1.9.20",
    "@types/luxon": "^3.7.1",
    "@types/node": "24.3.1",
    "@types/three": "0.180.0",
    "@typescript-eslint/utils": "8.43.0",
    "angular-eslint": "20.2.0",
    "autoprefixer": "^10.4.21",
    "cross-env": "^10.0.0",
    "eslint": "9.35.0",
    "eslint-config-prettier": "10.1.8",
    "eslint-plugin-playwright": "2.2.2",
    "jest": "30.1.3",
    "jest-environment-jsdom": "30.1.2",
    "jest-environment-node": "^30.0.2",
    "jest-preset-angular": "15.0.0",
    "jest-util": "30.0.5",
    "jsdom": "26.0.0",
    "jsonc-eslint-parser": "^2.4.0",
    "ng-packagr": "20.3.0",
    "nx": "21.5.1",
    "patch-package": "^8.0.0",
    "postcss": "^8.5.6",
    "postcss-url": "~10.1.3",
    "prettier": "3.6.2",
    "ts-jest": "29.4.1",
    "ts-node": "10.9.2",
    "tslib": "^2.8.1",
    "typescript": "5.9.2",
    "typescript-eslint": "8.43.0",
    "verdaccio": "^6.1.6"
  },
  "pnpm": {
    "overrides": {
      "@angular/core": "20.3.0",
      "@angular/common": "20.3.0",
      "@angular/compiler": "20.3.0",
      "@angular/compiler-cli": "20.3.0",
      "@angular/animations": "20.3.0",
      "@angular/forms": "20.3.0",
      "@angular/platform-browser": "20.3.0",
      "@angular/platform-browser-dynamic": "20.3.0",
      "@angular/platform-server": "20.3.0",
      "@angular/router": "20.3.0",
      "@angular/ssr": "20.3.0",
      "@angular/cdk": "20.2.2",
      "@ngrx/store": "20.0.1",
      "@ngrx/effects": "20.0.1",
      "@ngrx/router-store": "20.0.1",
      "@ngrx/component-store": "20.0.1",
      "@ngrx/entity": "20.0.1",
      "@ngrx/signals": "20.0.1",
      "@ngrx/store-devtools": "20.0.1"
    },
    "peerDependencyRules": {
      "ignoreMissing": [
        "@angular/localize"
      ],
      "allowedVersions": {
        "@angular/core": "20.3.0",
        "@angular/common": "20.3.0",
        "@angular/compiler": "20.3.0",
        "@ngrx/store": "20.0.1"
      }
    },
    "packageExtensions": {
      "@angular/core": {
        "peerDependencies": {
          "zone.js": "~0.15.1"
        }
      }
    }
  },
  "resolutions": {
    "@angular/core": "20.3.0",
    "@angular/common": "20.3.0",
    "@angular/compiler": "20.3.0",
    "@ngrx/store": "20.0.1"
  },
  "nx": {
    "includedScripts": []
  }
}
--- END OF FILE ---

--- START OF FILE project.json ---
{
  "name": "@royal-code/workspace-root",
  "$schema": "node_modules/nx/schemas/project-schema.json",
  "targets": {
    "local-registry": {
      "executor": "@nx/js:verdaccio",
      "options": {
        "port": 4873,
        "config": ".verdaccio/config.yml",
        "storage": "tmp/local-registry/storage"
      }
    }
  }
}
--- END OF FILE ---

--- START OF FILE tsconfig.base.json ---
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "bundler",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2023",
    "module": "esnext",
    "lib": ["es2023", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "strict": false,
    "noImplicitAny": false,
    "baseUrl": ".",
    "paths": {
      "@royal-code/auth/data-access": ["libs/auth/data-access/src/index.ts"],
      "@royal-code/auth/domain": ["libs/auth/domain/src/index.ts"],
      "@royal-code/core": ["libs/core/index.ts"],
      "@royal-code/core/config": ["libs/core/config/src/index.ts"],
      "@royal-code/core/core-logging": ["libs/core/core-logging/src/index.ts"],
      "@royal-code/core/error-handling": [
        "libs/core/error-handling/src/index.ts"
      ],
      "@royal-code/core/http": ["libs/core/http/src/index.ts"],
      "@royal-code/core/navigations/data-access": [
        "libs/core/navigation/data-access/src/index.ts"
      ],
      "@royal-code/core/navigations/state": [
        "libs/core/navigation/state/src/index.ts"
      ],
      "@royal-code/core/routing": ["libs/core/routing/src/index.ts"],
      "@royal-code/core/storage": ["libs/core/storage/src/index.ts"],
      "@royal-code/crafting": ["libs/features/crafting/src/index.ts"],
      "@royal-code/features/account/core": [
        "libs/features/account/core/src/index.ts"
      ],
      "@royal-code/features/account/data-access-droneshop": [
        "libs/features/account/data-access-droneshop/src/index.ts"
      ],
      "@royal-code/features/account/domain": [
        "libs/features/account/domain/src/index.ts"
      ],
      "@royal-code/features/account/ui-droneshop": [
        "libs/features/account/ui-droneshop/src/index.ts"
      ],
      "@royal-code/features/achievements": [
        "libs/features/achievements/src/index.ts"
      ],
      "@royal-code/features/admin-dashboard/core": [
        "libs/features/admin-dashboard/core/src/index.ts"
      ],
      "@royal-code/features/admin-dashboard/data-access": [
        "libs/features/admin-dashboard/data-access/src/index.ts"
      ],
      "@royal-code/features/admin-dashboard/domain": [
        "libs/features/admin-dashboard/domain/src/index.ts"
      ],
      "@royal-code/features/admin-orders/core": [
        "libs/features/admin-orders/core/src/index.ts"
      ],
      "@royal-code/features/admin-orders/data-access": [
        "libs/features/admin-orders/data-access/src/index.ts"
      ],
      "@royal-code/features/admin-orders/domain": [
        "libs/features/admin-orders/domain/src/index.ts"
      ],
      "@royal-code/features/admin-orders/ui": [
        "libs/features/admin-orders/ui/src/index.ts"
      ],
      "@royal-code/features/admin-products/core": [
        "libs/features/admin-products/core/src/index.ts"
      ],
      "@royal-code/features/admin-products/data-access": [
        "libs/features/admin-products/data-access/src/index.ts"
      ],
      "@royal-code/features/admin-products/domain": [
        "libs/features/admin-products/domain/src/index.ts"
      ],
      "@royal-code/features/admin-products/ui": [
        "libs/features/admin-products/ui/src/index.ts"
      ],
      "@royal-code/features/admin-reviews/core": [
        "libs/features/admin-reviews/core/src/index.ts"
      ],
      "@royal-code/features/admin-reviews/data-access": [
        "libs/features/admin-reviews/data-access/src/index.ts"
      ],
      "@royal-code/features/admin-reviews/domain": [
        "libs/features/admin-reviews/domain/src/index.ts"
      ],
      "@royal-code/features/admin-reviews/ui": [
        "libs/features/admin-reviews/ui/src/index.ts"
      ],
      "@royal-code/features/admin-users/core": [
        "libs/features/admin-users/core/src/index.ts"
      ],
      "@royal-code/features/admin-users/data-access": [
        "libs/features/admin-users/data-access/src/index.ts"
      ],
      "@royal-code/features/admin-users/domain": [
        "libs/features/admin-users/domain/src/index.ts"
      ],
      "@royal-code/features/admin-users/ui": [
        "libs/features/admin-users/ui/src/index.ts"
      ],
      "@royal-code/features/admin-variants/core": [
        "libs/features/admin-variants/core/src/index.ts"
      ],
      "@royal-code/features/admin-variants/data-access": [
        "libs/features/admin-variants/data-access/src/index.ts"
      ],
      "@royal-code/features/admin-variants/ui": [
        "libs/features/admin-variants/ui/src/index.ts"
      ],
      "@royal-code/features/ai-companion": [
        "libs/features/ai-companion/src/index.ts"
      ],
      "@royal-code/features/authentication": [
        "libs/features/authentication/src/index.ts"
      ],
      "@royal-code/features/avatar": ["libs/features/avatar/src/index.ts"],
      "@royal-code/features/avatar-customization": [
        "libs/features/avatar-customization/src/index.ts"
      ],
      "@royal-code/features/cart/core": [
        "libs/features/cart/core/src/index.ts"
      ],
      "@royal-code/features/cart/data-access-challenger": [
        "libs/features/cart/data-access-challenger/src/index.ts"
      ],
      "@royal-code/features/cart/data-access-plushie": [
        "libs/features/cart/data-access-plushie/src/index.ts"
      ],
      "@royal-code/features/cart/domain": [
        "libs/features/cart/domain/src/index.ts"
      ],
      "@royal-code/features/cart/ui-challenger": [
        "libs/features/cart/ui-challenger/src/index.ts"
      ],
      "@royal-code/features/cart/ui-plushie": [
        "libs/features/cart/ui-plushie/src/index.ts"
      ],
      "@royal-code/features/challenges": [
        "libs/features/challenges/src/index.ts"
      ],
      "@royal-code/features/character-progression": [
        "libs/features/character-progression/src/index.ts"
      ],
      "@royal-code/features/chat/core": [
        "libs/features/chat/core/src/index.ts"
      ],
      "@royal-code/features/chat/data-access-plushie": [
        "libs/features/chat/data-access-plushie/src/index.ts"
      ],
      "@royal-code/features/chat/domain": [
        "libs/features/chat/domain/src/index.ts"
      ],
      "@royal-code/features/chat/ui-challenger": [
        "libs/features/chat/ui-challenger/src/index.ts"
      ],
      "@royal-code/features/chat/ui-plushie": [
        "libs/features/chat/ui-plushie/src/index.ts"
      ],
      "@royal-code/features/checkout/core": [
        "libs/features/checkout/core/src/index.ts"
      ],
      "@royal-code/features/checkout/data-access-challenger": [
        "libs/features/checkout/data-access-challenger/src/index.ts"
      ],
      "@royal-code/features/checkout/data-access-plushie": [
        "libs/features/checkout/data-access-plushie/src/index.ts"
      ],
      "@royal-code/features/checkout/domain": [
        "libs/features/checkout/domain/src/index.ts"
      ],
      "@royal-code/features/checkout/ui-challenger": [
        "libs/features/checkout/ui-challenger/src/index.ts"
      ],
      "@royal-code/features/checkout/ui-plushie": [
        "libs/features/checkout/ui-plushie/src/index.ts"
      ],
      "@royal-code/features/guides/core": [
        "libs/features/guides/core/src/index.ts"
      ],
      "@royal-code/features/guides/data-access-droneshop": [
        "libs/features/guides/data-access-droneshop/src/index.ts"
      ],
      "@royal-code/features/guides/domain": [
        "libs/features/guides/domain/src/index.ts"
      ],
      "@royal-code/features/guides/ui-droneshop": [
        "libs/features/guides/ui-droneshop/src/index.ts"
      ],
      "@royal-code/features/guilds": ["libs/features/guilds/src/index.ts"],
      "@royal-code/features/inventory-equipment": [
        "libs/features/inventory-equipment/src/index.ts"
      ],
      "@royal-code/features/leaderboards": [
        "libs/features/leaderboards/src/index.ts"
      ],
      "@royal-code/features/media/core": [
        "libs/features/media/core/src/index.ts"
      ],
      "@royal-code/features/media/data-access-challenger": [
        "libs/features/media/data-access-challenger/src/index.ts"
      ],
      "@royal-code/features/media/data-access-plushie": [
        "libs/features/media/data-access-plushie/src/index.ts"
      ],
      "@royal-code/features/media/domain": [
        "libs/features/media/domain/src/index.ts"
      ],
      "@royal-code/features/media/ui-challenger": [
        "libs/features/media/ui-challenger/src/index.ts"
      ],
      "@royal-code/features/media/ui-plushie": [
        "libs/features/media/ui-plushie/src/index.ts"
      ],
      "@royal-code/features/nodes": ["libs/features/nodes/src/index.ts"],
      "@royal-code/features/orders/core": [
        "libs/features/orders/core/src/index.ts"
      ],
      "@royal-code/features/orders/data-access-challenger": [
        "libs/features/orders/data-access-challenger/src/index.ts"
      ],
      "@royal-code/features/orders/data-access-plushie": [
        "libs/features/orders/data-access-plushie/src/index.ts"
      ],
      "@royal-code/features/orders/domain": [
        "libs/features/orders/domain/src/index.ts"
      ],
      "@royal-code/features/orders/ui-challenger": [
        "libs/features/orders/ui-challenger/src/index.ts"
      ],
      "@royal-code/features/orders/ui-plushie": [
        "libs/features/orders/ui-plushie/src/index.ts"
      ],
      "@royal-code/features/party": ["libs/features/party/src/index.ts"],
      "@royal-code/features/products/core": [
        "libs/features/products/core/src/index.ts"
      ],
      "@royal-code/features/products/data-access-challenger": [
        "libs/features/products/data-access-challenger/src/index.ts"
      ],
      "@royal-code/features/products/data-access-droneshop": [
        "libs/features/products/data-access-droneshop/src/index.ts"
      ],
      "@royal-code/features/products/data-access-plushie": [
        "libs/features/products/data-access-plushie/src/index.ts"
      ],
      "@royal-code/features/products/domain": [
        "libs/features/products/domain/src/index.ts"
      ],
      "@royal-code/features/products/ui-challenger": [
        "libs/features/products/ui-challenger/src/index.ts"
      ],
      "@royal-code/features/products/ui-droneshop": [
        "libs/features/products/ui-droneshop/src/index.ts"
      ],
      "@royal-code/features/products/ui-plushie": [
        "libs/features/products/ui-plushie/src/index.ts"
      ],
      "@royal-code/features/progression": [
        "libs/features/progression/src/index.ts"
      ],
      "@royal-code/features/quests": ["libs/features/quests/src/index.ts"],
      "@royal-code/features/reviews/core": [
        "libs/features/reviews/core/src/index.ts"
      ],
      "@royal-code/features/reviews/data-access-challenger": [
        "libs/features/reviews/data-access-challenger/src/index.ts"
      ],
      "@royal-code/features/reviews/data-access-plushie": [
        "libs/features/reviews/data-access-plushie/src/index.ts"
      ],
      "@royal-code/features/reviews/domain": [
        "libs/features/reviews/domain/src/index.ts"
      ],
      "@royal-code/features/reviews/ui-challenger": [
        "libs/features/reviews/ui-challenger/src/index.ts"
      ],
      "@royal-code/features/reviews/ui-plushie": [
        "libs/features/reviews/ui-plushie/src/index.ts"
      ],
      "@royal-code/features/rewards": ["libs/features/rewards/src/index.ts"],
      "@royal-code/features/shared/node-challenge": [
        "libs/features/shared/node-challenge/src/index.ts"
      ],
      "@royal-code/features/shop": ["libs/features/shop/src/index.ts"],
      "@royal-code/features/social/core": [
        "libs/features/social/core/src/index.ts"
      ],
      "@royal-code/features/social/data-access": [
        "libs/features/social/data-access/src/index.ts"
      ],
      "@royal-code/features/social/domain": [
        "libs/features/social/domain/src/index.ts"
      ],
      "@royal-code/features/social/ui": [
        "libs/features/social/ui/src/index.ts"
      ],
      "@royal-code/features/social/ui-plushie": [
        "libs/features/social/ui-plushie/src/index.ts"
      ],
      "@royal-code/features/stats": ["libs/features/stats/src/index.ts"],
      "@royal-code/features/test": ["libs/features/test/src/index.ts"],
      "@royal-code/features/test/json-output-viewer": [
        "libs/features/test/json-output-viewer/src/index.ts"
      ],
      "@royal-code/features/themes": ["libs/features/themes/src/index.ts"],
      "@royal-code/features/tracking": ["libs/features/tracking/src/index.ts"],
      "@royal-code/features/users": ["libs/features/users/src/index.ts"],
      "@royal-code/features/wishlist/core": [
        "libs/features/wishlist/core/src/index.ts"
      ],
      "@royal-code/features/wishlist/data-access-droneshop": [
        "libs/features/wishlist/data-access-droneshop/src/index.ts"
      ],
      "@royal-code/features/wishlist/domain": [
        "libs/features/wishlist/domain/src/index.ts"
      ],
      "@royal-code/features/wishlist/ui-droneshop": [
        "libs/features/wishlist/ui-droneshop/src/index.ts"
      ],
      "@royal-code/mappers": ["libs/mappers/src/index.ts"],
      "@royal-code/mocks": ["libs/mocks/src/index.ts"],
      "@royal-code/shared": ["libs/shared/src/index.ts"],
      "@royal-code/shared/assets": ["libs/shared/assets/src/index.ts"],
      "@royal-code/shared/base-models": [
        "libs/shared/base-models/src/index.ts"
      ],
      "@royal-code/shared/domain": ["libs/shared/domain/src/index.ts"],
      "@royal-code/shared/domain/models": ["libs/shared/domain/src/models.ts"],
      "@royal-code/shared/initializers": [
        "libs/shared/initializers/src/index.ts"
      ],
      "@royal-code/shared/styles": ["libs/shared/styles/src/index.ts"],
      "@royal-code/shared/ui/layout": ["libs/shared/ui/layout/src/index.ts"],
      "@royal-code/shared/utils": ["libs/shared/utils/src/index.ts"],
      "@royal-code/store": ["libs/store/src/index.ts"],
      "@royal-code/store-notifications": [
        "libs/store/notifications/src/index.ts"
      ],
      "@royal-code/store/auth": ["libs/store/auth/src/index.ts"],
      "@royal-code/store/error": ["libs/store/error/src/index.ts"],
      "@royal-code/store/session": ["libs/store/session/src/index.ts"],
      "@royal-code/store/theme": ["libs/store/theme/src/index.ts"],
      "@royal-code/store/user": ["libs/store/user/src/index.ts"],
      "@royal-code/ui/accordion": ["libs/ui/accordion/src/index.ts"],
      "@royal-code/ui/avatar-renderer": [
        "libs/ui/avatar-renderer/src/index.ts"
      ],
      "@royal-code/ui/backgrounds": ["libs/ui/backgrounds/src/index.ts"],
      "@royal-code/ui/badge": ["libs/ui/badge/src/index.ts"],
      "@royal-code/ui/breadcrumb": ["libs/ui/breadcrumb/src/index.ts"],
      "@royal-code/ui/button": ["libs/ui/button/src/index.ts"],
      "@royal-code/ui/cards/card": ["libs/ui/cards/card/src/index.ts"],
      "@royal-code/ui/cards/feature-card": [
        "libs/ui/cards/feature-card/src/index.ts"
      ],
      "@royal-code/ui/cards/full-width-image-card": [
        "libs/ui/cards/full-width-image-card/src/index.ts"
      ],
      "@royal-code/ui/cards/icon-text-row": [
        "libs/ui/cards/icon-text-row/src/index.ts"
      ],
      "@royal-code/ui/cards/item-carousel": [
        "libs/ui/cards/item-carousel/src/index.ts"
      ],
      "@royal-code/ui/cards/product-accessory-card": [
        "libs/ui/cards/product-accessory-card/src/index.ts"
      ],
      "@royal-code/ui/cards/profile-avatar-card": [
        "libs/ui/cards/profile-avatar-card/src/index.ts"
      ],
      "@royal-code/ui/cards/settings-card": [
        "libs/ui/cards/settings-card/src/index.ts"
      ],
      "@royal-code/ui/cards/stat-card": [
        "libs/ui/cards/stat-card/src/index.ts"
      ],
      "@royal-code/ui/cards/story-card": [
        "libs/ui/cards/story-card/src/index.ts"
      ],
      "@royal-code/ui/code-block": ["libs/ui/code-block/src/index.ts"],
      "@royal-code/ui/dataflow-diagram": [
        "libs/ui/dataflow-diagram/src/index.ts"
      ],
      "@royal-code/ui/dialogs": ["libs/ui/dialogs/src/index.ts"],
      "@royal-code/ui/dropdown": ["libs/ui/dropdown/src/index.ts"],
      "@royal-code/ui/faq": ["libs/ui/faq/src/index.ts"],
      "@royal-code/ui/filters": ["libs/ui/filters/src/index.ts"],
      "@royal-code/ui/folder-tree": ["libs/ui/folder-tree/src/index.ts"],
      "@royal-code/ui/forms": ["libs/ui/forms/src/index.ts"],
      "@royal-code/ui/generic-overview": [
        "libs/ui/generic-overview/src/index.ts"
      ],
      "@royal-code/ui/gestures": ["libs/shared/ui/gestures/src/index.ts"],
      "@royal-code/ui/grid": ["libs/ui/grid/src/index.ts"],
      "@royal-code/ui/icon": ["libs/ui/icon/src/index.ts"],
      "@royal-code/ui/image": ["libs/ui/media/src/index.ts"],
      "@royal-code/ui/input": ["libs/ui/input/src/index.ts"],
      "@royal-code/ui/language-selector": [
        "libs/ui/language-selector/src/index.ts"
      ],
      "@royal-code/ui/list": ["libs/ui/list/src/index.ts"],
      "@royal-code/ui/media": ["libs/ui/media/src/index.ts"],
      "@royal-code/ui/menu": ["libs/ui/menu/src/index.ts"],
      "@royal-code/ui/meters": ["libs/ui/meters/src/index.ts"],
      "@royal-code/ui/navigation": ["libs/ui/navigation/src/index.ts"],
      "@royal-code/ui/notifications": ["libs/ui/notifications/src/index.ts"],
      "@royal-code/ui/overlay": ["libs/ui/overlay/src/index.ts"],
      "@royal-code/ui/pagination": ["libs/ui/pagination/src/index.ts"],
      "@royal-code/ui/paragraph": ["libs/ui/paragraph/src/index.ts"],
      "@royal-code/ui/products": ["libs/ui/products/src/index.ts"],
      "@royal-code/ui/progress": ["libs/ui/progress/src/index.ts"],
      "@royal-code/ui/quantity-input": ["libs/ui/quantity-input/src/index.ts"],
      "@royal-code/ui/rating": ["libs/ui/rating/src/index.ts"],
      "@royal-code/ui/review-card": ["libs/ui/review-card/src/index.ts"],
      "@royal-code/ui/sidebar": ["libs/ui/sidebar/src/index.ts"],
      "@royal-code/ui/spinner": ["libs/ui/spinner/src/index.ts"],
      "@royal-code/ui/sticky-cta-bar": ["libs/ui/sticky-cta-bar/src/index.ts"],
      "@royal-code/ui/swipe-up-menu": ["libs/ui/swipe-up-menu/src/index.ts"],
      "@royal-code/ui/tabs": ["libs/ui/tabs/src/index.ts"],
      "@royal-code/ui/team": ["libs/ui/team/src/index.ts"],
      "@royal-code/ui/testimonial": ["libs/ui/testimonial/src/index.ts"],
      "@royal-code/ui/textarea": ["libs/ui/textarea/src/index.ts"],
      "@royal-code/ui/theme-switcher": ["libs/ui/theme-switcher/src/index.ts"],
      "@royal-code/ui/title": ["libs/ui/title/src/index.ts"],
      "@royal-code/ui/variant-selector": [
        "libs/ui/variant-selector/src/index.ts"
      ],
      "@royal-code/ui/wishlist": ["libs/ui/wishlist/src/index.ts"],
      "@royal-code/users/data-access": ["libs/users/data-access/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
--- END OF FILE ---

--- START OF FILE vite.config.ts ---
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['leaflet/dist/leaflet.css']
    }
  }
});
--- END OF FILE ---

