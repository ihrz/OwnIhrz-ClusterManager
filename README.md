# OwnIhrz-ClusterManager

[OwnIhrz-ClusterManager](https://github.com/ihrz/OwnIhrz-ClusterManager) is a backend software used by iHorizon Productions to manage OwnIHRZ.

## Contributor's Wall

- [Kisakay](https://github.com/Kisakay) (She/Her)
- [Wyene](https://github.com/WyeneCloud) (He/Him)

## How to selfhost ?

_There are only some few software needed :_

- [NodeJS](https://nodejs.org) (**18 or higher required**)
- [Npm](https://npmjs.com) (**With NodeJS**)
- [Pm2](https://github.com/Unitech/pm2) (**Installed in global**)
- [Go](https://go.dev) (**>= 1.21 required**)


## What is OWNIHRZ?

**[OWNIHRZ](https://github.com/ihrz/ihrz/tree/ownihrz)** is a branch of the iHorizon Discord Bot hosted on GitHub. This branch is designed for customers who want a self-hosted iHorizon bot for their specific needs.

This repository serves as a backend API for managing OWNIHRZ's cluster, allowing actions such as erasing, deleting, shutting down, powering on, and pausing instances. All of these instances are powered by **[PM2](https://github.com/Unitech/pm2)**.

The code can be adapted for personal use, and the source code for OWNIHRZ's Manager can be found [here](https://github.com/ihrz/ihrz/blob/main/src/core/modules/ownihrzManager.ts). The repository is provided under the **MIT license**, in contrast to iHorizon, which is under a Creative Commons license.

## Structure of this code
The entire codebase is written in [Golang](https://go.dev), a powerful high-level language.

