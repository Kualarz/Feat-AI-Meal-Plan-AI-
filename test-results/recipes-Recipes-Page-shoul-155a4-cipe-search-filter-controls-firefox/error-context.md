# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Create Your Account" [level=1] [ref=e6]
      - paragraph [ref=e7]: Join Feast AI to start your nutrition journey
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: Full Name
        - textbox "John Doe" [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]: Email
        - textbox "you@example.com" [ref=e14]
      - generic [ref=e15]:
        - generic [ref=e16]: Password
        - textbox "At least 8 characters with uppercase, lowercase, and numbers" [ref=e17]
      - generic [ref=e18]:
        - generic [ref=e19]: Confirm Password
        - textbox "Confirm your password" [ref=e20]
      - button "Sign Up" [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - generic [ref=e27]: or
      - button "Continue as Guest" [active] [ref=e28] [cursor=pointer]
    - paragraph [ref=e30]:
      - text: Already have an account?
      - link "Sign In" [ref=e31] [cursor=pointer]:
        - /url: /auth/signin
  - alert [ref=e32]
```