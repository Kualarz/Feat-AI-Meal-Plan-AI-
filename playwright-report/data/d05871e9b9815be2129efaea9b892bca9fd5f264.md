# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - link "🍽️ Feast AI" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e7]: 🍽️
          - generic [ref=e8]: Feast AI
        - button "Toggle dark mode" [ref=e9] [cursor=pointer]:
          - img [ref=e10]
    - generic [ref=e14]:
      - heading "Browse Recipes" [level=2] [ref=e15]
      - generic [ref=e16]:
        - link "🔗 Import from URL" [ref=e17] [cursor=pointer]:
          - /url: /recipes/import
          - button "🔗 Import from URL" [ref=e18]
        - button "📹 Import from YouTube" [ref=e19] [cursor=pointer]
        - link "+ Add Recipe" [ref=e20] [cursor=pointer]:
          - /url: /recipes/add
          - button "+ Add Recipe" [ref=e21]
        - link "Planner" [ref=e22] [cursor=pointer]:
          - /url: /planner
          - button "Planner" [ref=e23]
        - link "Groceries" [ref=e24] [cursor=pointer]:
          - /url: /groceries
          - button "Groceries" [ref=e25]
        - link "Settings" [ref=e26] [cursor=pointer]:
          - /url: /setup
          - button "Settings" [ref=e27]
    - generic [ref=e31]: Loading recipes...
  - alert [ref=e32]
```