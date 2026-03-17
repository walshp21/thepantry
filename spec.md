# Kitchen Hub — spec.md

A simple household webapp for tracking pantry stock, grocery requests, and recipes.
Deployed on Vercel. Database on Turso (libSQL). No auth needed.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** Turso via `@libsql/client`
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## Rules

- Mobile-first. This will mostly be used on phones.
- No auth. It's a household tool on a trusted network.
- Keep it ugly-functional. No polish, no animations, no hero sections.
- Work through milestones in order. Do not skip ahead.
- After each milestone, stop and confirm it works before moving on.

---

## Database Schema

Create these tables during Milestone 1 setup:

```sql
CREATE TABLE pantry_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  in_stock INTEGER DEFAULT 1
);

CREATE TABLE requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  added_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL
);
```

---

## Milestone 1: Project setup + Pantry tab

### Goal
Get the project running with a single working tab.

### Tasks
1. Init a Next.js project with App Router and Tailwind.
2. Connect to Turso using `@libsql/client`. Put the connection URL and auth token in `.env.local`.
3. Create the database tables listed above.
4. Seed the pantry with these items:

| Category    | Items                                      |
|-------------|--------------------------------------------|
| Dairy       | Milk, Eggs, Butter, Cheese, Yoghurt        |
| Bakery      | Bread                                      |
| Meat        | Chicken                                    |
| Staples     | Rice, Pasta, Flour, Sugar, Olive Oil        |
| Produce     | Onions, Garlic, Tomatoes, Potatoes, Bananas, Apples |
| Drinks      | Coffee, Tea                                |

5. Build the Pantry tab:
   - Show all pantry items grouped by category.
   - Each item shows its name and a green/red indicator for in-stock / out-of-stock.
   - Tapping an item toggles its stock status.
   - Include a small "+ Add item" input at the bottom to add new items.

6. Add a simple tab bar at the bottom with three tabs: Pantry, Requests, Recipes.
   Only Pantry needs to work for now. The other two can be placeholder pages.

### Done when
- App runs locally and on Vercel.
- Pantry items display, toggle, and persist across page reloads.
- New items can be added.

---

## Milestone 2: Requests tab

### Goal
Let household members add free-text grocery requests.

### Tasks
1. Build the Requests tab:
   - A text input at the top with an "Add" button.
   - Below it, a list of all current requests, newest first.
   - Each request shows the text and a delete button.
   - Optional: an "added_by" field (just a text input, no login).
2. Add a "Clear all" button that deletes all requests (for after a grocery trip).

### Done when
- Requests can be added, viewed, and deleted.
- Data persists in Turso.

---

## Milestone 3: Recipes tab

### Goal
Show saved recipes and indicate which ingredients are in stock.

### Tasks
1. Seed 3-4 simple recipes with ingredients that reference pantry item names:

   **Pasta Aglio e Olio:** Pasta, Garlic, Olive Oil
   **Omelette:** Eggs, Butter, Cheese
   **Chicken Stir Fry:** Chicken, Rice, Onions, Garlic, Olive Oil
   **Banana Pancakes:** Bananas, Eggs, Flour, Milk, Butter

2. Build the Recipes tab:
   - Show a list of recipe names.
   - Tapping a recipe expands it to show its ingredients.
   - Each ingredient has a green checkmark or red X based on whether a matching pantry item is currently in-stock.
   - Matching is case-insensitive by ingredient_name against pantry_items.name.

3. Add a simple "Add recipe" form:
   - Recipe name input.
   - Ingredients as a comma-separated text input (e.g. "Chicken, Rice, Garlic").
   - Ingredients are stored as individual rows in recipe_ingredients.

### Done when
- Seeded recipes display with correct stock indicators.
- New recipes can be added.
- Changing stock status in Pantry tab is reflected when viewing a recipe.

---

## Seed Data Summary

### Pantry items (20)
Milk, Eggs, Butter, Cheese, Yoghurt, Bread, Chicken, Rice, Pasta, Flour, Sugar, Olive Oil, Onions, Garlic, Tomatoes, Potatoes, Bananas, Apples, Coffee, Tea

### Recipes (4)
- Pasta Aglio e Olio: Pasta, Garlic, Olive Oil
- Omelette: Eggs, Butter, Cheese
- Chicken Stir Fry: Chicken, Rice, Onions, Garlic, Olive Oil
- Banana Pancakes: Bananas, Eggs, Flour, Milk, Butter
