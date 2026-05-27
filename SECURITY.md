# Security Policy for EngLa API

The EngLa API team takes the security of our software products and services seriously. We appreciate the efforts of the security research community who help make our platform safer.

## Supported Versions

Since this project utilizes continuous delivery and `semantic-release`, we generally only provide security updates for the **latest major release**.

Please ensure you are testing against the most recent version available on the `main` branch or the latest published release tag.

| Version  | Supported          | Notes                               |
| -------- | ------------------ | ----------------------------------- |
| Latest   | :white_check_mark: | Actively receiving security patches |
| < Latest | :x:                | Deprecated. Please upgrade.         |

## Reporting a Vulnerability

**DO NOT report security vulnerabilities through public GitHub Issues or Discussions.** Doing so publicly exposes the vulnerability to malicious actors before we can issue a patch.

Instead, please report all security issues using GitHub's **Private Vulnerability Reporting** feature.

### How to report:

1. Go to the [Security tab](../../security/advisories) of this repository.
2. Click on **Advisories** in the left sidebar.
3. Click the **Report a vulnerability** button.
4. Please fill out the provided form as completely as possible:
   - **Description**: Use the default template (`Impact`, `Patches`, `Workarounds`, `References`). Focus heavily on the **Impact** (e.g., SQL Injection, XSS, RCE, IDOR) and provide step-by-step instructions or PoC (Proof of Concept) code to reproduce it.
   - **Affected products**: Select `npm` as the Ecosystem and enter `engla-api` (or the specific internal package) as the Package name.
   - **Severity**: Please use the built-in **CVSS calculator** to estimate the severity of the vulnerability based on Attack Vector, Complexity, etc.
   - **Weaknesses**: Tag the relevant CWE (e.g., CWE-89 for SQL Injection) if you know it.

### What to expect:

- We will acknowledge receipt of your vulnerability report within **48 hours**.
- We will send you regular updates about our progress via the private advisory thread.
- Once the issue is verified and patched, we will publish a security advisory and credit you for the discovery.

Thank you for helping keep the EngLa API secure!
