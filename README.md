test2/

├── features/
│  ├── step_definitions/
│  │  └── steps.js 
│  ├── support/
│  │  └── hooks.js
│  │  └── world.js
│  │  └── dataRender.js
│  └── login.feature
├── package.json
├── cucumber.js
└── data /
          └── agent.csv

test2/
├── features/
│   ├── step_definitions/
│   │   └── steps.js
│   ├── support/
│   │   ├── hooks.js
│   │   ├── world.js
│   │   └── dataReader.js 
│   └── login.feature
├── data/
│   └── agents.csv
├── package.json
├── cucumber.js
└── cucumber-parallel.config.js  # New file for parallel configuration



# Count the number of rows in your CSV file
CSV_ROWS=$(($(wc -l < ./data/agents.csv) - 1))

# Run with the exact number of workers as CSV rows
npx cucumber-js --parallel $CSV_ROWS

# Or run with a specific number of workers
npx cucumber-js --parallel 12




git remote add origin https://github.com/suyash-slashrtc/MultiUsers_login-_test.git
git branch -M main
git push -u origin main