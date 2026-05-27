# [1.1.0](https://github.com/GamesFire/engla-api/compare/v1.0.1...v1.1.0) (2026-05-27)

- **release:** trigger v2 production release with ABAC and media pipeline ([da87e1c](https://github.com/GamesFire/engla-api/commit/da87e1cd3f34aaf16ff65bb1b70344f828c1e61c))

### Features

- **security:** implement granular ABAC authorization, admin permission sync, and global permissions dictionary
- **properties:** implement property lifecycle (draft, pending, active, archived) and smart deletion logic
- **properties:** implement moderation flow with auto-activation and admin rejection reasons
- **media:** integrate Cloudinary for property images and user avatars with fault-tolerant Multer pipelines
- **amenities:** implement global amenities dictionary and Many-to-Many property relations
- **architecture:** implement centralized Rate Limiters and upgrade error handling for file uploads

### Refactoring & Improvements

- **database:** add comprehensive indexing and unsigned constraints for optimized performance
- **infrastructure:** update Node.js requirement to v22.22.1 and optimize Vitest path resolution

## [1.0.1](https://github.com/GamesFire/engla-api/compare/v1.0.0...v1.0.1) (2026-02-10)

### Bug Fixes

- add backmerge token ([bb7a65d](https://github.com/GamesFire/engla-api/commit/bb7a65ddb3a483336bdd28f48f71f39d4583c93e))
- add token directly to backmerge ci ([f612ff4](https://github.com/GamesFire/engla-api/commit/f612ff4e02e8758f58a393cb9d028140e200a948))

# 1.0.0 (2026-02-10)

### Features

- initial release setup ([85678af](https://github.com/GamesFire/engla-api/commit/85678af031dbc1332182f345eb3347c5232e9fad))
